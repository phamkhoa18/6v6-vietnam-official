import { NextResponse } from "next/server";

// POST /api/auth/logout
export async function POST() {
    const response = NextResponse.json({ success: true, message: "Đăng xuất thành công" });
    response.cookies.set("token", "", { httpOnly: true, maxAge: 0, path: "/" });
    return response;
}
