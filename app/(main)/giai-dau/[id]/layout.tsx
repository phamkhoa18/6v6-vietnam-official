import { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Tournament from "@/models/Tournament";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    try {
        await dbConnect();
        const { id } = await params;
        const tournament = await Tournament.findById(id).lean();

        if (!tournament) {
            return {
                title: "Không tìm thấy giải đấu - 6v6 Vietnam Official",
                description: "Giải đấu bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."
            };
        }

        const title = tournament.seo?.title || `${tournament.title} - 6v6 Vietnam Official`;
        const description = tournament.seo?.description || tournament.description || `Xem chi tiết, bảng xếp hạng và lịch thi đấu của giải ${tournament.title} trên 6v6 Vietnam.`;
        const images = tournament.banner || tournament.thumbnail || "/images/banner/bg-nen.png";

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                images: [images],
                type: "website",
            },
            twitter: {
                card: "summary_large_image",
                title,
                description,
                images: [images],
            }
        };
    } catch (error) {
        return {
            title: "Chi tiết giải đấu - 6v6 Vietnam Official"
        };
    }
}

export default function TournamentDetailLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
