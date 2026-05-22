import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Registration from "@/models/Registration";
import Tournament from "@/models/Tournament";
import User from "@/models/User";
import Notification from "@/models/Notification";
import { requireAuth, apiResponse, apiError } from "@/lib/auth";

interface RouteParams {
    params: Promise<{ id: string }>;
}

// POST /api/tournaments/[id]/register — Register for a tournament
export async function POST(req: NextRequest, { params }: RouteParams) {
    try {
        await dbConnect();
        const authResult = await requireAuth(req);
        if (authResult instanceof Response) return authResult;

        const { id } = await params;
        const body = await req.json();

        // Check tournament exists and is open for registration
        const tournament = await Tournament.findById(id);
        if (!tournament) return apiError("Giải đấu không tồn tại", 404);
        if (tournament.status !== "registration" && tournament.status !== "ongoing") {
            return apiError("Giải đấu chưa mở đăng ký", 400);
        }

        const maxSlots = tournament.maxSlots || (tournament as any).maxTeams || 0;
        const currentSlots = tournament.currentSlots || (tournament as any).currentTeams || 0;
        if (maxSlots > 0 && currentSlots >= maxSlots) {
            return apiError("Giải đấu đã đầy slot đăng ký", 400);
        }

        // Check if already registered
        const existing = await Registration.findOne({
            tournament: id,
            user: authResult.user._id,
            status: { $nin: ["rejected", "withdrawn"] },
        });
        if (existing) return apiError("Bạn đã đăng ký giải này rồi", 400);

        // Build registration data
        const regData: any = {
            tournament: id,
            user: authResult.user._id,
            playerName: body.playerName || authResult.user.name,
            phone: body.phone,
            personalPhoto: body.personalPhoto,
            dateOfBirth: body.dateOfBirth,
            address: body.address,
            teamName: body.teamName,
            teamShortName: body.teamShortName,
            teamLogo: body.teamLogo,
            teamLineupPhoto: body.teamLineupPhoto,
            status: "pending",

            facebookName: body.facebookName,
            facebookLink: body.facebookLink,
            province: body.province,
            notes: body.notes,

            player2Name: body.player2Name,
            player2FacebookName: body.player2FacebookName,
            player2FacebookLink: body.player2FacebookLink,

            player3Name: body.player3Name,
            player3FacebookName: body.player3FacebookName,
            player3FacebookLink: body.player3FacebookLink,
        };

        // Validate teammates for 2v2/3v3
        if (tournament.gameMode === "2v2" || tournament.gameMode === "3v3") {
            const p2Id = body.player2Id || body.player2UserId;
            if (p2Id) {
                // Check: cannot add yourself as teammate
                if (p2Id === authResult.user._id.toString()) {
                    return apiError("Không thể thêm chính mình làm đồng đội", 400);
                }
                const p2 = await User.findById(p2Id);
                if (!p2) return apiError("Đồng đội 2 không tồn tại trên hệ thống", 400);

                // Check: player2 must not be already registered in this tournament
                const p2Reg = await Registration.findOne({
                    tournament: id,
                    status: { $nin: ["rejected", "withdrawn"] },
                    $or: [
                        { user: p2Id },
                        { player2: p2Id },
                        { player3: p2Id },
                    ],
                });
                if (p2Reg) return apiError(`${p2.name} đã tham gia đội khác trong giải này`, 400);

                regData.player2 = p2Id;
            }
            const p3Id = body.player3Id || body.player3UserId;
            if (tournament.gameMode === "3v3" && p3Id) {
                // Check: cannot add yourself as teammate
                if (p3Id === authResult.user._id.toString()) {
                    return apiError("Không thể thêm chính mình làm đồng đội", 400);
                }
                // Check: p3 must not be same as p2
                if (p2Id && p3Id === p2Id) {
                    return apiError("VĐV 2 và VĐV 3 không thể là cùng một người", 400);
                }
                const p3 = await User.findById(p3Id);
                if (!p3) return apiError("Đồng đội 3 không tồn tại trên hệ thống", 400);

                // Check: player3 must not be already registered in this tournament
                const p3Reg = await Registration.findOne({
                    tournament: id,
                    status: { $nin: ["rejected", "withdrawn"] },
                    $or: [
                        { user: p3Id },
                        { player2: p3Id },
                        { player3: p3Id },
                    ],
                });
                if (p3Reg) return apiError(`${p3.name} đã tham gia đội khác trong giải này`, 400);

                regData.player3 = p3Id;
            }
        }

        const registration = await Registration.create(regData);
        // Don't increment currentSlots here — only when admin approves

        // Notify admins/managers about new registration
        const admins = await User.find({ role: { $in: ["admin", "manager"] } }).select("_id").lean();
        const notifs = admins.map(admin => ({
            recipient: admin._id,
            type: "registration",
            title: "Đăng ký mới",
            message: `${regData.playerName} đã đăng ký giải ${tournament.title}`,
            link: `/manager/giai-dau/${id}/dang-ky`,
        }));
        if (notifs.length > 0) await Notification.insertMany(notifs);

        return apiResponse(registration, 201, "Đăng ký thành công! Vui lòng chờ duyệt.");
    } catch (error: any) {
        console.error("Register error:", error);
        return apiError(error.message || "Có lỗi xảy ra", 500);
    }
}

// GET /api/tournaments/[id]/register — Check if current user is registered
export async function GET(req: NextRequest, { params }: RouteParams) {
    try {
        await dbConnect();
        const authResult = await requireAuth(req);
        if (authResult instanceof Response) return apiResponse(null, 200);

        const { id } = await params;
        const userId = authResult.user._id;

        // Check as captain (main registrant)
        let reg = await Registration.findOne({
            tournament: id,
            user: userId,
            status: { $nin: ["rejected", "withdrawn"] },
        }).lean();

        // Also check if registered as player2 or player3 in someone else's team
        if (!reg) {
            reg = await Registration.findOne({
                tournament: id,
                status: { $nin: ["rejected", "withdrawn"] },
                $or: [
                    { player2: userId },
                    { player3: userId },
                ],
            }).lean();
        }

        return apiResponse(reg);
    } catch (error: any) {
        return apiError(error.message, 500);
    }
}

// DELETE /api/tournaments/[id]/register — Cancel own registration
export async function DELETE(req: NextRequest, { params }: RouteParams) {
    try {
        await dbConnect();
        const authResult = await requireAuth(req);
        if (authResult instanceof Response) return authResult;

        const { id } = await params;
        const reg = await Registration.findOne({
            tournament: id,
            user: authResult.user._id,
            status: "pending",
        });
        if (!reg) return apiError("Không tìm thấy đăng ký hoặc đã được duyệt", 400);

        reg.status = "withdrawn";
        await reg.save();

        return apiResponse(null, 200, "Đã hủy đăng ký thành công");
    } catch (error: any) {
        return apiError(error.message, 500);
    }
}
