import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { generateToken, apiResponse, apiError } from "@/lib/auth";

// POST /api/auth/verify
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email, code } = await req.json();

        if (!email || !code) return apiError("Vui lòng nhập email và mã xác minh", 400);

        const user = await User.findOne({ email: email.toLowerCase() }).select("+verificationCode +verificationCodeExpires");
        if (!user) return apiError("Không tìm thấy tài khoản", 404);
        if (user.isVerified) return apiError("Tài khoản đã được xác minh", 400);

        if (!user.verificationCode || !user.verificationCodeExpires) {
            return apiError("Mã xác minh không hợp lệ. Vui lòng yêu cầu mã mới", 400);
        }

        if (new Date() > user.verificationCodeExpires) {
            return apiError("Mã xác minh đã hết hạn. Vui lòng yêu cầu mã mới", 400);
        }

        if (user.verificationCode !== code) {
            return apiError("Mã xác minh không đúng", 400);
        }

        user.isVerified = true;
        user.verificationCode = undefined;
        user.verificationCodeExpires = undefined;
        await user.save();

        const token = generateToken(user);

        const response = apiResponse({
            user: {
                _id: user._id, playerId: user.playerId, name: user.name, email: user.email, role: user.role,
                avatar: user.avatar, nickname: user.nickname, teamName: user.teamName,
            },
            token,
        }, 200, "Xác minh thành công!");

        response.cookies.set("token", token, {
            httpOnly: true, secure: process.env.NODE_ENV === "production",
            sameSite: "lax", maxAge: 7 * 24 * 60 * 60, path: "/",
        });

        return response;
    } catch (error: any) {
        console.error("Verify error:", error);
        return apiError("Có lỗi xảy ra", 500);
    }
}
