import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { apiResponse, apiError } from "@/lib/auth";
import { generateVerificationCode, sendVerificationEmail } from "@/lib/email";

// POST /api/auth/resend-code
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email } = await req.json();

        if (!email) return apiError("Vui lòng nhập email", 400);

        const user = await User.findOne({ email: email.toLowerCase() }).select("+verificationCode +verificationCodeExpires");
        if (!user) return apiError("Không tìm thấy tài khoản", 404);
        if (user.isVerified) return apiError("Tài khoản đã được xác minh", 400);

        const code = generateVerificationCode();
        user.verificationCode = code;
        user.verificationCodeExpires = new Date(Date.now() + 5 * 60 * 1000);
        await user.save();

        const emailResult = await sendVerificationEmail(email, user.name, code);
        return apiResponse(
            { emailSent: emailResult.success },
            200,
            emailResult.success ? "Mã xác minh đã được gửi lại" : "Không gửi được email. Vui lòng thử lại"
        );
    } catch (error: any) {
        console.error("Resend code error:", error);
        return apiError("Có lỗi xảy ra", 500);
    }
}
