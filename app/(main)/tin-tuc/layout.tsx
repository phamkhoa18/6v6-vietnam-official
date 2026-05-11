import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Tin tức - 6v6 Vietnam Official",
    description: "Cập nhật tin tức mới nhất về bóng đá sân 6 tại Việt Nam. Thông báo giải đấu, chiến thuật, và các bài viết chuyên sâu.",
};

export default function TinTucLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
