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
            status: "pending",
        };

        // Validate teammates for 2v2/3v3
        if (tournament.gameMode === "2v2" || tournament.gameMode === "3v3") {
            if (body.player2Id) {
                const p2 = await User.findById(body.player2Id);
                if (!p2) return apiError("Đồng đội 2 không tồn tại trên hệ thống", 400);
                regData.player2 = body.player2Id;
            }
            if (tournament.gameMode === "3v3" && body.player3Id) {
                const p3 = await User.findById(body.player3Id);
                if (!p3) return apiError("Đồng đội 3 không tồn tại trên hệ thống", 400);
                regData.player3 = body.player3Id;
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
            message: `${regData.playerName} đã đăng ký giải ${tournament.name}`,
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
        const reg = await Registration.findOne({
            tournament: id,
            user: authResult.user._id,
            status: { $nin: ["rejected", "withdrawn"] },
        }).lean();

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
