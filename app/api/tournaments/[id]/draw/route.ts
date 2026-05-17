import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Team from "@/models/Team";
import Registration from "@/models/Registration";
import Match from "@/models/Match";
import { getCurrentUser } from "@/lib/auth";

// POST /api/tournaments/[id]/draw — Execute draw (assign groups & create matches)
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const user = await getCurrentUser(req);
        if (!user || (user.role !== "admin" && user.role !== "manager")) {
            return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
        }

        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return NextResponse.json({ success: false, message: "Không tìm thấy giải đấu" }, { status: 404 });
        }

        const isTeamMode = tournament.gameMode !== "1v1";

        // Get active participants
        const participants: any[] = isTeamMode
            ? await Team.find({ tournament: id, status: "active" }).lean()
            : await Registration.find({ tournament: id, status: "active" }).lean();

        if (participants.length < 2) {
            return NextResponse.json({ success: false, message: "Cần ít nhất 2 đội/cầu thủ để bóc thăm" }, { status: 400 });
        }

        // Clear existing matches
        await Match.deleteMany({ tournament: id });

        // Reset seeds/groups
        if (isTeamMode) {
            await Team.updateMany({ tournament: id }, { $unset: { seed: 1, group: 1 } });
        } else {
            await Registration.updateMany({ tournament: id }, { $unset: { seed: 1, group: 1 } });
        }

        // Shuffle participants for random draw
        const shuffled = [...participants].sort(() => Math.random() - 0.5);

        let groups: { name: string; slots: string[] }[] = [];
        const matchesToCreate: any[] = [];

        const updateSeed = async (pId: string, seed: number, group?: string) => {
            const update: any = { seed };
            if (group) update.group = group;
            if (isTeamMode) await Team.findByIdAndUpdate(pId, update);
            else await Registration.findByIdAndUpdate(pId, update);
        };

        if (tournament.format === "single_elimination") {
            for (let i = 0; i < shuffled.length; i++) {
                await updateSeed(shuffled[i]._id.toString(), i + 1);
            }

            const totalSlots = Math.pow(2, Math.ceil(Math.log2(shuffled.length)));
            const round1Matches = totalSlots / 2;

            for (let i = 0; i < round1Matches; i++) {
                const a = shuffled[i * 2] || null;
                const b = shuffled[i * 2 + 1] || null;
                if (!a) continue;

                const matchData: any = {
                    tournament: id, round: 1, matchNumber: i + 1, status: "scheduled",
                };

                if (isTeamMode) {
                    matchData.teamA = a._id;
                    if (b) matchData.teamB = b._id;
                } else {
                    matchData.playerA = a.user;
                    if (b) matchData.playerB = b.user;
                }

                if (!b) {
                    matchData.status = "completed";
                    matchData.scoreA = 0; matchData.scoreB = 0;
                    matchData.winner = "A"; matchData.resultType = "walkover";
                }

                matchesToCreate.push(matchData);
            }

            // Subsequent rounds
            const totalRounds = Math.ceil(Math.log2(totalSlots));
            for (let round = 2; round <= totalRounds; round++) {
                const cnt = totalSlots / Math.pow(2, round);
                for (let i = 0; i < cnt; i++) {
                    matchesToCreate.push({ tournament: id, round, matchNumber: i + 1, status: "scheduled" });
                }
            }

        } else if (tournament.format === "round_robin") {
            for (let i = 0; i < shuffled.length; i++) {
                await updateSeed(shuffled[i]._id.toString(), i + 1);
            }

            // All unique pairs
            const n = shuffled.length;
            let matchNum = 0;
            const matchesPerRound = Math.floor(n / 2) || 1;

            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    matchNum++;
                    const round = Math.ceil(matchNum / matchesPerRound);
                    const numInRound = ((matchNum - 1) % matchesPerRound) + 1;

                    const matchData: any = {
                        tournament: id, round, matchNumber: numInRound, status: "scheduled",
                    };
                    if (isTeamMode) {
                        matchData.teamA = shuffled[i]._id;
                        matchData.teamB = shuffled[j]._id;
                    } else {
                        matchData.playerA = shuffled[i].user;
                        matchData.playerB = shuffled[j].user;
                    }
                    matchesToCreate.push(matchData);
                }
            }

        } else if (tournament.format === "group_stage") {
            const teamsPerGroup = tournament.scoring.teamsPerGroup || 4;
            const numGroups = Math.ceil(shuffled.length / teamsPerGroup);
            const groupNames = "ABCDEFGHIJKLMNOP".split("");

            // Assign to groups (snake draft)
            for (let i = 0; i < shuffled.length; i++) {
                const groupIndex = i % numGroups;
                const groupName = groupNames[groupIndex];

                if (!groups.find(g => g.name === groupName)) {
                    groups.push({ name: groupName, slots: [] });
                }
                groups.find(g => g.name === groupName)!.slots.push(shuffled[i]._id.toString());
                await updateSeed(shuffled[i]._id.toString(), i + 1, groupName);
            }

            // Create group stage matches (round-robin within each group)
            for (const group of groups) {
                const groupTeams = shuffled.filter(s => group.slots.includes(s._id.toString()));
                let matchNum = 1;

                for (let i = 0; i < groupTeams.length; i++) {
                    for (let j = i + 1; j < groupTeams.length; j++) {
                        const matchData: any = {
                            tournament: id, round: 1, matchNumber: matchNum++,
                            group: group.name, status: "scheduled",
                        };
                        if (isTeamMode) {
                            matchData.teamA = groupTeams[i]._id;
                            matchData.teamB = groupTeams[j]._id;
                        } else {
                            matchData.playerA = groupTeams[i].user;
                            matchData.playerB = groupTeams[j].user;
                        }
                        matchesToCreate.push(matchData);
                    }
                }
            }

            // Save groups to tournament
            await Tournament.findByIdAndUpdate(id, {
                groups: groups.map(g => ({ name: g.name, slots: g.slots })),
            });
        }

        // Bulk create matches
        if (matchesToCreate.length > 0) {
            await Match.insertMany(matchesToCreate);
        }

        // Fetch created matches
        const createdMatches = await Match.find({ tournament: id })
            .populate("teamA", "name shortName logo")
            .populate("teamB", "name shortName logo")
            .sort("group round matchNumber")
            .lean();

        return NextResponse.json({
            success: true,
            data: { groups, matches: createdMatches, totalMatches: createdMatches.length },
            message: `Đã bóc thăm thành công! Tạo ${createdMatches.length} trận đấu.`,
        });
    } catch (error: any) {
        console.error("Draw error:", error);
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
