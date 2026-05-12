import { NextRequest } from "next/server";
import dbConnect from "@/lib/mongodb";
import Category from "@/models/Category";
import { apiResponse, apiError } from "@/lib/auth";

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const categories = await Category.find({ isActive: true }).sort({ order: 1 });
        return apiResponse({ categories });
    } catch (error: any) {
        console.error("Get categories error:", error);
        return apiError("Có lỗi xảy ra", 500);
    }
}
