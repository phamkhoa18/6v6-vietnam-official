import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Notification from "@/models/Notification";
import { requireAuth, apiResponse, apiError } from "@/lib/auth";

// GET /api/notifications — Fetch user's notifications
export async function GET(req: NextRequest) {
    try {
        const authResult = await requireAuth(req);
        if (authResult instanceof Response) return authResult;

        await dbConnect();

        const notifications = await Notification.find({ recipient: authResult.user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .lean();

        const unreadCount = await Notification.countDocuments({ recipient: authResult.user._id, isRead: false });

        return apiResponse({ notifications, unreadCount });
    } catch (error: any) {
        return apiError(error.message, 500);
    }
}

// PUT /api/notifications — Mark all as read
export async function PUT(req: NextRequest) {
    try {
        const authResult = await requireAuth(req);
        if (authResult instanceof Response) return authResult;

        await dbConnect();

        await Notification.updateMany(
            { recipient: authResult.user._id, isRead: false },
            { $set: { isRead: true } }
        );

        return apiResponse(null, 200, "Đã đánh dấu đọc tất cả");
    } catch (error: any) {
        return apiError(error.message, 500);
    }
}
