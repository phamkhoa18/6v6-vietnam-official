import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Registration from "@/models/Registration";

/**
 * GET /api/users/search-public?q=...&tournamentId=...&excludeUserId=...
 * Public endpoint for searching users by playerId or name.
 * Returns limited fields only (no phone/email for privacy).
 * Used by registration forms to link teammates in 2v2/3v3.
 * 
 * Optional params:
 * - tournamentId: If provided, marks users already registered in this tournament
 * - excludeUserId: If provided, excludes this user from results (self-exclusion)
 */
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");
        const tournamentId = searchParams.get("tournamentId");
        const excludeUserId = searchParams.get("excludeUserId");

        if (!query || query.trim().length < 1) {
            return NextResponse.json({ success: true, data: [] });
        }

        const orConditions: any[] = [];

        // If numeric, search by playerId
        const numQuery = parseInt(query);
        if (!isNaN(numQuery)) {
            orConditions.push({ playerId: numQuery });
        }

        // Always search by name/nickname (case-insensitive)
        const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), "i");
        orConditions.push({ name: regex });
        orConditions.push({ nickname: regex });

        const filter: any = { $or: orConditions, isActive: true };

        // Exclude self from results
        if (excludeUserId) {
            filter._id = { $ne: excludeUserId };
        }

        const users = await User.find(filter)
            .select("name avatar playerId nickname teamName")
            .limit(8)
            .lean();

        // If tournamentId provided, check which users are already registered
        if (tournamentId && users.length > 0) {
            const userIds = users.map(u => u._id.toString());
            const existingRegs = await Registration.find({
                tournament: tournamentId,
                status: { $nin: ["rejected", "withdrawn"] },
                $or: [
                    { user: { $in: userIds } },
                    { player2: { $in: userIds } },
                    { player3: { $in: userIds } },
                ],
            }).select("user player2 player3 playerName teamName").lean();

            // Build set of registered user IDs
            const registeredIds = new Set<string>();
            const regInfoMap = new Map<string, string>(); // userId → team/player name
            existingRegs.forEach((r: any) => {
                const teamLabel = r.teamName || r.playerName || "đội khác";
                if (r.user) { registeredIds.add(r.user.toString()); regInfoMap.set(r.user.toString(), teamLabel); }
                if (r.player2) { registeredIds.add(r.player2.toString()); regInfoMap.set(r.player2.toString(), teamLabel); }
                if (r.player3) { registeredIds.add(r.player3.toString()); regInfoMap.set(r.player3.toString(), teamLabel); }
            });

            // Mark users with registration status
            const enriched = users.map((u: any) => ({
                ...u,
                isRegistered: registeredIds.has(u._id.toString()),
                registeredTeam: regInfoMap.get(u._id.toString()) || null,
            }));

            return NextResponse.json({ success: true, data: enriched });
        }

        return NextResponse.json({ success: true, data: users });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
}
