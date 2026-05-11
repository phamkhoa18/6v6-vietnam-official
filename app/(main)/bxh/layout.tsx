import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Bảng Xếp Hạng - 6v6 Vietnam Official",
    description: "Bảng xếp hạng cầu thủ và đội bóng sân 6 hàng đầu Việt Nam. Theo dõi thành tích thi đấu qua các giải đấu.",
};

export default function BXHLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
