import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import { requireAuth, apiResponse, apiError } from "@/lib/auth";

// GET /api/auth/me
export async function GET(req: NextRequest) {
    try {
        const authResult = await requireAuth(req);
        if (authResult instanceof NextResponse) return authResult;

        await dbConnect();
        const user = await User.findById(authResult.user._id);
        if (!user) return apiError("Không tìm thấy người dùng", 404);

        return apiResponse({
            _id: user._id, playerId: user.playerId, name: user.name, email: user.email, role: user.role,
            avatar: user.avatar, phone: user.phone, bio: user.bio, jerseyNumber: user.jerseyNumber,
            dateOfBirth: user.dateOfBirth, country: user.country, province: user.province,
            teamName: user.teamName,
            facebookName: user.facebookName, facebookLink: user.facebookLink,
            stats: user.stats, isActive: user.isActive, lastLogin: user.lastLogin, createdAt: user.createdAt,
        });
    } catch (error) {
        console.error("Get profile error:", error);
        return apiError("Có lỗi xảy ra", 500);
    }
}

// PUT /api/auth/me
export async function PUT(req: NextRequest) {
    try {
        const authResult = await requireAuth(req);
        if (authResult instanceof NextResponse) return authResult;

        await dbConnect();
        const body = await req.json();
        const { name, phone, bio, jerseyNumber, avatar, dateOfBirth, country, province, teamName, facebookName, facebookLink } = body;

        const user = await User.findByIdAndUpdate(
            authResult.user._id,
            {
                ...(name && { name }), ...(phone !== undefined && { phone }),
                ...(bio !== undefined && { bio }), ...(jerseyNumber !== undefined && { jerseyNumber }),
                ...(avatar !== undefined && { avatar }), ...(dateOfBirth !== undefined && { dateOfBirth }),
                ...(country !== undefined && { country }), ...(province !== undefined && { province }),
                ...(teamName !== undefined && { teamName }),
                ...(facebookName !== undefined && { facebookName }), ...(facebookLink !== undefined && { facebookLink }),
            },
            { returnDocument: 'after', runValidators: true }
        );

        if (!user) return apiError("Không tìm thấy người dùng", 404);

        return apiResponse({
            _id: user._id, playerId: user.playerId, name: user.name, email: user.email, role: user.role,
            avatar: user.avatar, phone: user.phone, bio: user.bio, jerseyNumber: user.jerseyNumber,
            dateOfBirth: user.dateOfBirth, country: user.country, province: user.province,
            teamName: user.teamName,
            facebookName: user.facebookName, facebookLink: user.facebookLink, stats: user.stats,
        }, 200, "Cập nhật thành công");
    } catch (error: any) {
        console.error("Update profile error:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((err: any) => err.message);
            return apiError(messages.join(", "), 400);
        }
        return apiError("Có lỗi xảy ra", 500);
    }
}
