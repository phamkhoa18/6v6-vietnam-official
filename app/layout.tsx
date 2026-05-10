import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog";
import Script from "next/script";

export const viewport: Viewport = {
    themeColor: "#DC2626",
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

const siteName = "6v6 Vietnam Official";
const siteDescription = "Giải đấu bóng đá eFootball 6v6 chuyên nghiệp tại Việt Nam";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://6v6vietnam.vn";

export const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
        default: `${siteName} - Giải Đấu eFootball 6v6 Chuyên Nghiệp`,
        template: `%s | ${siteName}`,
    },
    description: siteDescription,
    keywords: ["6v6", "efootball", "giải đấu", "bóng đá", "esports", "vietnam"],
    authors: [{ name: siteName }],
    creator: siteName,
    publisher: siteName,
    alternates: {
        canonical: siteUrl,
    },
    icons: {
        icon: "/favicon.ico",
    },
    openGraph: {
        title: siteName,
        description: siteDescription,
        url: siteUrl,
        siteName: siteName,
        locale: "vi_VN",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: siteName,
        description: siteDescription,
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_ID;
    const facebookPixelId = process.env.NEXT_PUBLIC_FB_PIXEL_ID;

    return (
        <html lang="vi">
            <head>
                {/* Google Analytics */}
                {googleAnalyticsId && (
                    <>
                        <Script
                            src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
                            strategy="afterInteractive"
                        />
                        <Script id="gtag-init" strategy="afterInteractive">
                            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${googleAnalyticsId}');`}
                        </Script>
                    </>
                )}
                {/* Facebook Pixel */}
                {facebookPixelId && (
                    <Script id="fb-pixel" strategy="afterInteractive">
                        {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${facebookPixelId}');fbq('track','PageView');`}
                    </Script>
                )}
            </head>
            <body className="antialiased">
                <AuthProvider>
                    <ConfirmDialogProvider>
                        {children}
                    </ConfirmDialogProvider>
                    <Toaster position="top-right" richColors />
                </AuthProvider>
            </body>
        </html>
    );
}
