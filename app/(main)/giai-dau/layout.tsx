import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Giải đấu - 6v6 Vietnam Official",
    description: "Khám phá các giải đấu bóng đá sân 6 đang diễn ra, tham gia thi đấu và leo bảng xếp hạng.",
};

export default function GiaiDauLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
