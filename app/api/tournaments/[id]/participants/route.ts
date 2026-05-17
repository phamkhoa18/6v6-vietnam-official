import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";
import Team from "@/models/Team";
import Registration from "@/models/Registration";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { getCurrentUser } from "@/lib/auth";

// GET /api/tournaments/[id]/participants — List participants (teams or registrations)
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const tournament = await Tournament.findById(id).lean();
        if (!tournament) {
            return NextResponse.json({ success: false, message: "Không tìm thấy giải đấu" }, { status: 404 });
        }

        let participants: any[] = [];
        if (tournament.gameMode === "1v1") {
            participants = await Registration.find({ tournament: id })
                .populate("user", "name avatar nickname playerId province")
                .sort("-registeredAt")
                .lean();
        } else {
            participants = await Team.find({ tournament: id })
                .populate("captain", "name avatar nickname")
                .populate("members.user", "name avatar nickname playerId")
                .sort("-registeredAt")
                .lean();
        }

        return NextResponse.json({
            success: true,
            data: { participants, gameMode: tournament.gameMode },
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}

// PUT /api/tournaments/[id]/participants — Update participant status (approve/reject/seed/group)
export async function PUT(
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

        const body = await req.json();
        const { participantId, status, seed, group } = body;

        const is1v1 = tournament.gameMode === "1v1";
        const update: any = {};
        if (status) update.status = status;
        if (seed !== undefined) update.seed = seed;
        if (group !== undefined) update.group = group;

        const participant = is1v1
            ? await Registration.findOneAndUpdate({ _id: participantId, tournament: id }, { $set: update }, { new: true })
            : await Team.findOneAndUpdate({ _id: participantId, tournament: id }, { $set: update }, { new: true });

        if (!participant) {
            return NextResponse.json({ success: false, message: "Không tìm thấy" }, { status: 404 });
        }

        // Update currentSlots count
        const activeCount = is1v1
            ? await Registration.countDocuments({ tournament: id, status: "active" })
            : await Team.countDocuments({ tournament: id, status: "active" });
        await Tournament.findByIdAndUpdate(id, { currentSlots: activeCount });

        return NextResponse.json({ success: true, data: { participant } });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}


// POST /api/tournaments/[id]/participants — Add a participant manually with Smart Roster
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const currentUser = await getCurrentUser(req);
        
        if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "manager")) {
            return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
        }

        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return NextResponse.json({ success: false, message: "Không tìm thấy giải đấu" }, { status: 404 });
        }

        const body = await req.json();
        const { name, shortName, logo, players } = body;

        if (!players || players.length === 0) {
            return NextResponse.json({ success: false, message: "Thiếu thông tin người chơi" }, { status: 400 });
        }

        // Process all players (create virtual accounts if needed)
        const processedUserIds = [];
        for (const p of players) {
            if (p.isNew) {
                // Quick create user
                const randomStr = Math.random().toString(36).substring(7);
                const virtualEmail = `guest_${Date.now()}_${randomStr}@6v6.local`;
                const hashedPassword = await bcrypt.hash(randomStr, 10);
                
                const newVirtualUser = await User.create({
                    name: p.name || "Khách",
                    email: virtualEmail,
                    password: hashedPassword,
                    phone: p.phone || "",
                    role: "user"
                });
                processedUserIds.push(newVirtualUser._id);
            } else {
                processedUserIds.push(p.userId);
            }
        }

        const captainId = processedUserIds[0];
        let newParticipant;

        if (tournament.gameMode === "1v1") {
            // 1v1 Mode
            newParticipant = await Registration.create({
                tournament: id,
                user: captainId,
                status: "active",
                registeredAt: new Date()
            });
            
            newParticipant = await Registration.findById(newParticipant._id)
                .populate("user", "name avatar nickname phone playerId")
                .lean();
        } else {
            const members = processedUserIds.map((uid, idx) => ({
                user: uid,
                role: (idx === 0 ? "captain" : "player") as "captain" | "player",
                joinedAt: new Date()
            }));

            newParticipant = await Team.create({
                name,
                shortName: shortName?.toUpperCase() || name.substring(0,4).toUpperCase(),
                logo: logo || undefined,
                tournament: id,
                captain: captainId,
                members: members,
                status: "active" // Automatically approved
            });
            
            newParticipant = await Team.findById(newParticipant._id)
                .populate("captain", "name avatar nickname")
                .populate("members.user", "name avatar nickname playerId phone")
                .lean();
        }

        // Update slots
        const activeCount = tournament.gameMode === "1v1"
            ? await Registration.countDocuments({ tournament: id, status: "active" })
            : await Team.countDocuments({ tournament: id, status: "active" });
        await Tournament.findByIdAndUpdate(id, { currentSlots: activeCount });

        return NextResponse.json({ success: true, data: { participant: newParticipant } });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
