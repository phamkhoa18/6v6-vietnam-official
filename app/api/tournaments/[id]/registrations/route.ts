import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Tournament from "@/models/Tournament";
import Notification from "@/models/Notification";
import { requireAuth, apiResponse, apiError } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/tournaments/[id]/registrations — List all registrations (admin/manager)
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        await dbConnect();
        const authResult = await requireAuth(req);
        if (authResult instanceof Response) return authResult;
        if (authResult.user.role !== "admin" && authResult.user.role !== "manager") {
            return apiError("Không có quyền", 403);
        }

        const { id } = await params;
        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const query: any = { tournament: id };
        if (status && status !== "all") {
            // 'active' is functionally same as 'approved' (after team creation)
            if (status === "approved") {
                query.status = { $in: ["approved", "active"] };
            } else {
                query.status = status;
            }
        }

        const registrations = await Registration.find(query)
            .populate("user", "name email avatar playerId gamerId phone facebookName facebookLink province dateOfBirth nickname")
            .populate("player2", "name avatar playerId gamerId facebookName facebookLink province dateOfBirth nickname")
            .populate("player3", "name avatar playerId gamerId facebookName facebookLink province dateOfBirth nickname")
            .populate("approvedBy", "name")
            .sort({ createdAt: -1 })
            .lean();

        return apiResponse(registrations);
    } catch (error: any) {
        return apiError(error.message, 500);
    }
}

// PATCH /api/tournaments/[id]/registrations — Approve/reject a registration
export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        await dbConnect();
        const authResult = await requireAuth(req);
        if (authResult instanceof Response) return authResult;
        if (authResult.user.role !== "admin" && authResult.user.role !== "manager") {
            return apiError("Không có quyền", 403);
        }

        const { id } = await params;
        const body = await req.json();
        const { registrationId, action, rejectionReason } = body;

        if (!registrationId || !["approve", "reject", "update_info"].includes(action)) {
            return apiError("Thiếu thông tin", 400);
        }

        const tournament = await Tournament.findById(id);
        const reg = await Registration.findOne({ _id: registrationId, tournament: id });
        if (!reg) return apiError("Đăng ký không tồn tại", 404);

        if (action === "update_info") {
            const fields = [
                "playerName", "teamName", "teamShortName", "phone", "email",
                "facebookName", "facebookLink", "province", "dateOfBirth", "notes",
                "personalPhoto", "teamLineupPhoto",
                "player2", "player2Name", "player2FacebookName", "player2FacebookLink",
                "player3", "player3Name", "player3FacebookName", "player3FacebookLink"
            ];
            fields.forEach(f => {
                if (body[f] !== undefined) {
                    (reg as any)[f] = body[f];
                }
            });
            await reg.save();

            // Sync with Team if approved
            if (reg.status === "active" || reg.status === "approved") {
                if (tournament?.gameMode !== "1v1") {
                    const { default: Team } = await import("@/models/Team");
                    const team = await Team.findOne({ tournament: id, captain: reg.user });
                    if (team) {
                        if (reg.teamName) team.name = reg.teamName;
                        if (reg.teamShortName) team.shortName = reg.teamShortName;
                        if (reg.teamLogo || reg.personalPhoto || reg.teamLineupPhoto) {
                            team.logo = reg.teamLogo || reg.personalPhoto || reg.teamLineupPhoto;
                        }
                        
                        // Sync members
                        const members: any[] = [{ user: reg.user, role: "captain", joinedAt: new Date() }];
                        if (reg.player2) members.push({ user: reg.player2 as any, role: "player", joinedAt: new Date() });
                        if (reg.player3) members.push({ user: reg.player3 as any, role: "player", joinedAt: new Date() });
                        team.members = members;
                        
                        await team.save();
                    }
                }
            }
            return apiResponse(reg, 200, "Đã cập nhật thông tin thành công");
        }

        if (action === "approve") {
            reg.status = "active"; // Set to active so it's ready
            reg.approvedBy = authResult.user._id as any;
            reg.approvedAt = new Date();
            
            // Auto-create Team for team-based modes
            if (tournament?.gameMode !== "1v1") {
                const { default: Team } = await import("@/models/Team");
                const existingTeam = await Team.findOne({ tournament: id, captain: reg.user });
                if (!existingTeam) {
                    const members: any[] = [{ user: reg.user, role: "captain", joinedAt: new Date() }];
                    if (reg.player2) members.push({ user: reg.player2 as any, role: "player", joinedAt: new Date() });
                    if (reg.player3) members.push({ user: reg.player3 as any, role: "player", joinedAt: new Date() });
                    
                    await Team.create({
                        name: reg.teamName || reg.playerName || "Đội",
                        shortName: reg.teamShortName || reg.teamName?.substring(0,4).toUpperCase() || "TEAM",
                        logo: reg.teamLogo || reg.personalPhoto,
                        tournament: id,
                        captain: reg.user,
                        members: members,
                        status: "active"
                    });
                }
            }

            // Increment slot count only on approval
            await Tournament.findByIdAndUpdate(id, { $inc: { currentSlots: 1 } });
        } else {
            // If was previously approved, decrement slot count and maybe handle Team deletion? (Keep it simple for now)
            if (reg.status === "approved" || reg.status === "active") {
                await Tournament.findByIdAndUpdate(id, { $inc: { currentSlots: -1 } });
                if (tournament?.gameMode !== "1v1") {
                    const { default: Team } = await import("@/models/Team");
                    await Team.findOneAndDelete({ tournament: id, captain: reg.user });
                }
            }
            reg.status = "rejected";
            reg.rejectionReason = rejectionReason || "Không đạt yêu cầu";
        }

        await reg.save();

        // Notify the user about their registration status
        const tInfo = await Tournament.findById(id).select("title").lean();
        await Notification.create({
            recipient: reg.user,
            type: "registration",
            title: action === "approve" ? "Đăng ký được duyệt ✅" : "Đăng ký bị từ chối ❌",
            message: action === "approve"
                ? `Đăng ký của bạn tại giải ${tInfo?.title || ''} đã được duyệt thành công!`
                : `Đăng ký của bạn tại giải ${tInfo?.title || ''} đã bị từ chối. Lý do: ${reg.rejectionReason || ''}`,
            link: `/giai-dau/${id}`,
        });

        return apiResponse(reg, 200, action === "approve" ? "Đã duyệt thành công" : "Đã từ chối");
    } catch (error: any) {
        return apiError(error.message, 500);
    }
}
