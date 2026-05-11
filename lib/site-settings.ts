import dbConnect from "@/lib/mongodb";
import SiteSettings from "@/models/SiteSettings";

export interface PublicSiteSettings {
    siteName: string;
    siteTagline: string;
    siteDescription: string;
    siteUrl: string;
    logo: string;
    logoDark: string;
    favicon: string;
    appleTouchIcon: string;
    ogImage: string;
    bxhMobileOgImage?: string;
    bxhConsoleOgImage?: string;
    bxhTeamsOgImage?: string;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string[];
    socialFacebook: string;
    socialYoutube: string;
    socialTiktok: string;
    socialDiscord: string;
    socialTwitter: string;
    socialInstagram: string;
    socialTelegram: string;
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;
    copyrightText: string;
    maintenanceMode: boolean;
    googleAnalyticsId: string;
    facebookPixelId: string;
    customHeadCode: string;
    customFooterCode: string;
}

// Default values for 6v6 Platform
const defaults: PublicSiteSettings = {
    siteName: "6v6 Vietnam",
    siteTagline: "Hệ thống quản lý giải đấu bóng đá sân 6",
    siteDescription: "Nền tảng tổ chức và quản lý giải đấu bóng đá 6v6 hàng đầu Việt Nam. Tạo giải đấu chuyên nghiệp, quản lý đội hình, theo dõi kết quả trực tiếp.",
    siteUrl: "https://6v6.vn",
    logo: "",
    logoDark: "",
    favicon: "",
    appleTouchIcon: "",
    ogImage: "/images/banner/bg-nen.png",
    bxhMobileOgImage: "/images/banner/bg-nen.png",
    bxhConsoleOgImage: "/images/banner/bg-nen.png",
    bxhTeamsOgImage: "/images/banner/bg-nen.png",
    seoTitle: "6v6 Vietnam - Hệ thống giải bóng đá sân 6",
    seoDescription: "Nền tảng tổ chức và quản lý giải đấu bóng đá sân 6 hàng đầu Việt Nam. Kết nối đam mê, chinh phục giải đấu.",
    seoKeywords: ["6v6", "bóng đá sân 6", "giải đấu", "tournament", "Việt Nam", "tổ chức giải", "quản lý bóng đá"],
    socialFacebook: "",
    socialYoutube: "",
    socialTiktok: "",
    socialDiscord: "",
    socialTwitter: "",
    socialInstagram: "",
    socialTelegram: "",
    contactEmail: "",
    contactPhone: "",
    contactAddress: "",
    copyrightText: "© 2026 6v6 Vietnam. Mọi quyền được bảo lưu.",
    maintenanceMode: false,
    googleAnalyticsId: "",
    facebookPixelId: "",
    customHeadCode: "",
    customFooterCode: "",
};

/**
 * Fetch site settings from database (server-side only).
 * Used in generateMetadata and server components.
 * Returns defaults if DB is unavailable.
 */
export async function getSiteSettings(): Promise<PublicSiteSettings> {
    try {
        await dbConnect();
        const settings = await SiteSettings.findOne().lean();
        if (!settings) return defaults;

        return {
            siteName: settings.siteName || defaults.siteName,
            siteTagline: settings.siteTagline || defaults.siteTagline,
            siteDescription: settings.siteDescription || defaults.siteDescription,
            siteUrl: settings.siteUrl || defaults.siteUrl,
            logo: settings.logo || defaults.logo,
            logoDark: settings.logoDark || defaults.logoDark,
            favicon: settings.favicon || defaults.favicon,
            appleTouchIcon: settings.appleTouchIcon || defaults.appleTouchIcon,
            ogImage: settings.ogImage || defaults.ogImage,
            bxhMobileOgImage: settings.bxhMobileOgImage || defaults.bxhMobileOgImage,
            bxhConsoleOgImage: settings.bxhConsoleOgImage || defaults.bxhConsoleOgImage,
            bxhTeamsOgImage: settings.bxhTeamsOgImage || defaults.bxhTeamsOgImage,
            seoTitle: settings.seoTitle || defaults.seoTitle,
            seoDescription: settings.seoDescription || defaults.seoDescription,
            seoKeywords: settings.seoKeywords?.length ? settings.seoKeywords : defaults.seoKeywords,
            socialFacebook: settings.socialFacebook || "",
            socialYoutube: settings.socialYoutube || "",
            socialTiktok: settings.socialTiktok || "",
            socialDiscord: settings.socialDiscord || "",
            socialTwitter: settings.socialTwitter || "",
            socialInstagram: settings.socialInstagram || "",
            socialTelegram: settings.socialTelegram || "",
            contactEmail: settings.contactEmail || "",
            contactPhone: settings.contactPhone || "",
            contactAddress: settings.contactAddress || "",
            copyrightText: settings.copyrightText || defaults.copyrightText,
            maintenanceMode: settings.maintenanceMode || false,
            googleAnalyticsId: settings.googleAnalyticsId || "",
            facebookPixelId: settings.facebookPixelId || "",
            customHeadCode: settings.customHeadCode || "",
            customFooterCode: settings.customFooterCode || "",
        };
    } catch (error) {
        console.error("getSiteSettings error:", error);
        return defaults;
    }
}
