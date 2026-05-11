import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { apiResponse, apiError } from "@/lib/auth";
import { sendResetPasswordEmail } from "@/lib/email";

// POST /api/auth/forgot-password
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email, step, code, newPassword } = await req.json();

        if (!email) return apiError("Vui lòng nhập email", 400);

        // Step 1: Request code
        if (step === "request" || !step) {
            const user = await User.findOne({ email: email.toLowerCase().trim() });
            if (!user) return apiResponse({ sent: true }, 200, "Nếu email tồn tại, mã xác nhận đã được gửi");

            const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
            const resetExpires = new Date(Date.now() + 15 * 60 * 1000);

            await User.findByIdAndUpdate(user._id, { resetPasswordCode: resetCode, resetPasswordCodeExpires: resetExpires });

            const emailResult = await sendResetPasswordEmail(user.email, user.name, resetCode);
            if (!emailResult.success) return apiError("Không thể gửi email. Vui lòng thử lại sau.", 500);

            return apiResponse({ sent: true }, 200, "Mã xác nhận đã được gửi đến email của bạn");
        }

        // Step 2: Verify + reset
        if (step === "reset") {
            if (!code) return apiError("Vui lòng nhập mã xác nhận", 400);
            if (!newPassword) return apiError("Vui lòng nhập mật khẩu mới", 400);
            if (newPassword.length < 8) return apiError("Mật khẩu phải có ít nhất 8 ký tự", 400);

            const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+resetPasswordCode +resetPasswordCodeExpires");
            if (!user) return apiError("Email không tồn tại", 400);
            if (!user.resetPasswordCode || !user.resetPasswordCodeExpires) return apiError("Bạn chưa yêu cầu đặt lại mật khẩu", 400);
            if (user.resetPasswordCodeExpires < new Date()) return apiError("Mã xác nhận đã hết hạn", 400);
            if (user.resetPasswordCode !== code) return apiError("Mã xác nhận không đúng", 400);

            const hashedPassword = await bcrypt.hash(newPassword, 12);
            await User.findByIdAndUpdate(user._id, { password: hashedPassword, resetPasswordCode: null, resetPasswordCodeExpires: null });

            return apiResponse(null, 200, "Đặt lại mật khẩu thành công!");
        }

        return apiError("Bước không hợp lệ", 400);
    } catch (error: any) {
        console.error("Forgot password error:", error);
        return apiError("Có lỗi xảy ra", 500);
    }
}
