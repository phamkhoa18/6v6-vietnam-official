import mongoose, { Document, Schema } from "mongoose";

export interface ISiteSettings extends Document {
    // === Website Identity ===
    siteName: string;
    siteTagline: string;
    siteDescription: string;
    siteUrl: string;

    // === Branding ===
    logo: string; // URL to logo image
    logoDark: string; // URL to dark mode logo
    favicon: string; // URL to favicon (16x16, 32x32)
    appleTouchIcon: string; // URL to Apple touch icon (180x180)
    ogImage: string; // Default Open Graph image (1200x630)
    bxhMobileOgImage?: string;
    bxhConsoleOgImage?: string;
    bxhTeamsOgImage?: string;

    // === SEO ===
    seoTitle: string; // Default meta title
    seoDescription: string; // Default meta description
    seoKeywords: string[]; // Meta keywords
    googleSiteVerification: string; // Google Search Console verification
    bingSiteVerification: string;
    robotsTxt: string; // Custom robots.txt content

    // === Social Media ===
    socialFacebook: string;
    socialYoutube: string;
    socialTiktok: string;
    socialDiscord: string;
    socialTwitter: string;
    socialInstagram: string;
    socialTelegram: string;

    // === Contact Info ===
    contactEmail: string;
    contactPhone: string;
    contactAddress: string;

    // === Email / SMTP ===
    smtpHost: string;
    smtpPort: number;
    smtpSecure: boolean;
    smtpUser: string;
    smtpPass: string;
    smtpFromName: string;
    smtpFromEmail: string;
    emailEnabled: boolean;

    // === Advanced ===
    googleAnalyticsId: string; // GA4 Measurement ID
    facebookPixelId: string;
    customHeadCode: string; // Custom code injected in <head>
    customFooterCode: string; // Custom code injected before </body>
    maintenanceMode: boolean;
    registrationEnabled: boolean;
    copyrightText: string;

    // === Timestamps ===
    updatedAt: Date;
    updatedBy: string;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
    {
        // Website Identity
        siteName: { type: String, default: "6v6 Vietnam" },
        siteTagline: { type: String, default: "Hệ thống quản lý giải đấu bóng đá sân 6" },
        siteDescription: { type: String, default: "Nền tảng tổ chức và quản lý giải đấu bóng đá 6v6 hàng đầu Việt Nam. Tạo giải đấu chuyên nghiệp, quản lý đội hình, theo dõi kết quả trực tiếp." },
        siteUrl: { type: String, default: "https://6v6.vn" },

        // Branding
        logo: { type: String, default: "" },
        logoDark: { type: String, default: "" },
        favicon: { type: String, default: "" },
        appleTouchIcon: { type: String, default: "" },
        ogImage: { type: String, default: "/images/banner/bg-nen.png" },
        bxhMobileOgImage: { type: String, default: "" },
        bxhConsoleOgImage: { type: String, default: "" },
        bxhTeamsOgImage: { type: String, default: "" },

        // SEO
        seoTitle: { type: String, default: "6v6 Vietnam - Hệ thống giải bóng đá sân 6" },
        seoDescription: { type: String, default: "Nền tảng tổ chức và quản lý giải đấu bóng đá sân 6 hàng đầu Việt Nam. Kết nối đam mê, chinh phục giải đấu." },
        seoKeywords: { type: [String], default: ["6v6", "bóng đá sân 6", "giải đấu", "tournament", "Việt Nam", "tổ chức giải", "quản lý bóng đá"] },
        googleSiteVerification: { type: String, default: "" },
        bingSiteVerification: { type: String, default: "" },
        robotsTxt: { type: String, default: "" },

        // Social Media
        socialFacebook: { type: String, default: "" },
        socialYoutube: { type: String, default: "" },
        socialTiktok: { type: String, default: "" },
        socialDiscord: { type: String, default: "" },
        socialTwitter: { type: String, default: "" },
        socialInstagram: { type: String, default: "" },
        socialTelegram: { type: String, default: "" },

        // Contact
        contactEmail: { type: String, default: "" },
        contactPhone: { type: String, default: "" },
        contactAddress: { type: String, default: "" },

        // Email / SMTP
        smtpHost: { type: String, default: "" },
        smtpPort: { type: Number, default: 587 },
        smtpSecure: { type: Boolean, default: false },
        smtpUser: { type: String, default: "" },
        smtpPass: { type: String, default: "" },
        smtpFromName: { type: String, default: "6v6 Vietnam" },
        smtpFromEmail: { type: String, default: "" },
        emailEnabled: { type: Boolean, default: false },

        // Advanced
        googleAnalyticsId: { type: String, default: "" },
        facebookPixelId: { type: String, default: "" },
        customHeadCode: { type: String, default: "" },
        customFooterCode: { type: String, default: "" },
        maintenanceMode: { type: Boolean, default: false },
        registrationEnabled: { type: Boolean, default: true },
        copyrightText: { type: String, default: "© 2026 6v6 Vietnam. All rights reserved." },

        // Meta
        updatedBy: { type: String, default: "" },
    },
    { timestamps: true }
);

// Singleton pattern
SiteSettingsSchema.statics.getSingleton = async function () {
    let settings = await this.findOne();
    if (!settings) {
        settings = await this.create({});
    }
    return settings;
};

if (mongoose.models.SiteSettings) {
    delete mongoose.models.SiteSettings;
}

const SiteSettings = mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);

export default SiteSettings;
