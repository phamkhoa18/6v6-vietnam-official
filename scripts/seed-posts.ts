// Seed 3 categories + 20 posts into MongoDB
// Run: npx tsx scripts/seed-posts.ts

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/6v6vietnam";

// ─── Schemas (inline to avoid import issues) ───

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, trim: true },
    description: { type: String, default: "" },
    icon: { type: String, default: "Newspaper" },
    color: { type: String, default: "#1b64f2" },
    gradient: { type: String, default: "from-blue-500 to-blue-600" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    postCount: { type: Number, default: 0 },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
}, { timestamps: true });

const PostSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    excerpt: { type: String, default: "" },
    content: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    category: { type: String, default: "news" },
    categoryRef: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    tags: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    isPinned: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
    readingTime: { type: Number, default: 1 },
    publishedAt: { type: Date },
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model("Category", CategorySchema);
const Post = mongoose.models.Post || mongoose.model("Post", PostSchema);

// ─── Helpers ───

function slugify(text: string): string {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d").replace(/Đ/g, "D")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
        + "-" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
}

function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomDate(daysBack: number) {
    const d = new Date();
    d.setDate(d.getDate() - randomInt(0, daysBack));
    d.setHours(randomInt(6, 22), randomInt(0, 59));
    return d;
}

// ─── Data ───

const categoriesData = [
    { name: "Tin tức", slug: "tin-tuc", description: "Tin tức bóng đá phong trào mới nhất", icon: "Newspaper", color: "#A01B1B", gradient: "from-red-500 to-red-600", order: 1 },
    { name: "Giải đấu", slug: "giai-dau", description: "Thông tin các giải đấu 6v6 và small-sided", icon: "Trophy", color: "#D97706", gradient: "from-amber-500 to-amber-600", order: 2 },
    { name: "Hướng dẫn", slug: "huong-dan", description: "Hướng dẫn chiến thuật, kỹ thuật bóng đá phong trào", icon: "BookOpen", color: "#059669", gradient: "from-emerald-500 to-emerald-600", order: 3 },
];

const postsData = [
    // Tin tức (7 bài)
    { cat: 0, title: "6v6 Vietnam chính thức ra mắt hệ thống BXH mới 2026", excerpt: "Hệ thống bảng xếp hạng mới với thuật toán ELO cải tiến, mang đến trải nghiệm cạnh tranh công bằng hơn cho tất cả cầu thủ.", tags: ["BXH", "6v6", "cập nhật"], featured: true, pinned: true },
    { cat: 0, title: "Kết quả vòng chung kết giải Small-sided Games mùa Xuân 2026", excerpt: "Trận chung kết kịch tính với tỷ số 3-2, đội FC Đại Bàng xuất sắc giành chức vô địch sau loạt penalty nghẹt thở.", tags: ["small-sided", "kết quả", "mùa xuân"] },
    { cat: 0, title: "Danh sách cầu thủ xuất sắc nhất tháng 5/2026", excerpt: "Top 10 cầu thủ có phong độ tốt nhất trong tháng 5, dẫn đầu là tiền đạo Nguyễn Văn Hùng với 12 bàn thắng.", tags: ["cầu thủ", "top", "tháng 5"] },
    { cat: 0, title: "Cập nhật luật thi đấu mới cho mùa giải 2026-2027", excerpt: "Ban tổ chức công bố những thay đổi quan trọng về luật thi đấu, bao gồm quy định mới về thay người và thời gian thi đấu.", tags: ["luật", "cập nhật", "2026"] },
    { cat: 0, title: "6v6 Vietnam hợp tác cùng adidas tổ chức giải đấu quốc tế", excerpt: "Lần đầu tiên giải đấu bóng đá phong trào Việt Nam có sự đồng hành của thương hiệu thể thao hàng đầu thế giới.", tags: ["hợp tác", "adidas", "quốc tế"], featured: true },
    { cat: 0, title: "Phỏng vấn: Đội trưởng FC Sài Gòn chia sẻ bí quyết vô địch", excerpt: "Anh Trần Minh Đức, đội trưởng FC Sài Gòn, chia sẻ về hành trình chinh phục chức vô địch và kế hoạch mùa giải tới.", tags: ["phỏng vấn", "FC Sài Gòn"] },
    { cat: 0, title: "Sân cỏ nhân tạo mới tại quận 7 đạt chuẩn FIFA Quality", excerpt: "Sân bóng 6v6 Arena tại quận 7, TP.HCM chính thức đạt chứng nhận FIFA Quality, trở thành sân thứ 3 tại Việt Nam.", tags: ["sân cỏ", "FIFA", "quận 7"] },

    // Giải đấu (7 bài)
    { cat: 1, title: "Giải 2v2 là gì? Tất tần tật về thể thức thi đấu 2v2", excerpt: "Khám phá thể thức thi đấu 2v2 đang hot nhất hiện nay, từ luật chơi đến chiến thuật giúp bạn chiến thắng.", tags: ["2v2", "thể thức", "hướng dẫn"] },
    { cat: 1, title: "Lịch thi đấu giải 6v6 Championship Cup tháng 6/2026", excerpt: "Chi tiết lịch thi đấu của 16 đội mạnh nhất tranh tài tại giải 6v6 Championship Cup mùa hè.", tags: ["lịch thi đấu", "championship", "tháng 6"] },
    { cat: 1, title: "Mở đăng ký giải đấu Small-sided Games mùa Hè 2026", excerpt: "Giải đấu Small-sided Games lớn nhất mùa hè chính thức mở đăng ký với tổng giải thưởng lên đến 50 triệu đồng.", tags: ["đăng ký", "small-sided", "mùa hè"], featured: true },
    { cat: 1, title: "Kết quả bốc thăm chia bảng giải Futsal Vô Địch Quốc Gia", excerpt: "32 đội đã được chia vào 8 bảng đấu, hứa hẹn những trận cầu kịch tính ngay từ vòng bảng.", tags: ["bốc thăm", "futsal", "quốc gia"] },
    { cat: 1, title: "Đội hình tiêu biểu vòng bảng giải 6v6 Premier League", excerpt: "11 cầu thủ xuất sắc nhất được bình chọn từ các trận đấu vòng bảng giải 6v6 Premier League.", tags: ["đội hình tiêu biểu", "premier league"] },
    { cat: 1, title: "Giải thưởng Golden Boot 2026 thuộc về ai?", excerpt: "Cuộc đua giành giải Vua phá lưới đang vô cùng hấp dẫn với 3 ứng viên sáng giá nhất mùa giải.", tags: ["golden boot", "vua phá lưới", "2026"] },
    { cat: 1, title: "FC Thủ Đức bất ngờ loại ứng viên vô địch tại tứ kết", excerpt: "Với lối chơi phòng ngự phản công sắc bén, FC Thủ Đức đã tạo nên cú sốc lớn nhất giải đấu.", tags: ["tứ kết", "FC Thủ Đức", "bất ngờ"] },

    // Hướng dẫn (6 bài)
    { cat: 2, title: "5 chiến thuật phòng ngự hiệu quả nhất trong bóng đá 6v6", excerpt: "Phân tích chi tiết 5 chiến thuật phòng ngự được các đội top sử dụng nhiều nhất trong bóng đá 6 người.", tags: ["chiến thuật", "phòng ngự", "6v6"] },
    { cat: 2, title: "Cách xây dựng đội hình 6v6 cho người mới bắt đầu", excerpt: "Hướng dẫn từ A-Z cách xây dựng và quản lý đội bóng 6v6 hiệu quả, từ tuyển quân đến luyện tập.", tags: ["đội hình", "người mới", "hướng dẫn"] },
    { cat: 2, title: "Bài tập rèn thể lực cho cầu thủ phong trào", excerpt: "Chương trình tập luyện 4 tuần giúp nâng cao thể lực, sức bền và tốc độ cho cầu thủ nghiệp dư.", tags: ["thể lực", "luyện tập", "phong trào"] },
    { cat: 2, title: "Tổng hợp kỹ năng đá phạt góc hiệu quả trong sân nhỏ", excerpt: "Các kỹ thuật đá phạt góc đặc biệt dành cho sân 6v6, giúp tận dụng tối đa cơ hội ghi bàn từ tình huống cố định.", tags: ["phạt góc", "kỹ thuật", "sân nhỏ"] },
    { cat: 2, title: "Dinh dưỡng cho cầu thủ: Ăn gì trước và sau trận đấu?", excerpt: "Chế độ dinh dưỡng khoa học giúp cầu thủ phong trào duy trì năng lượng và phục hồi nhanh sau thi đấu.", tags: ["dinh dưỡng", "sức khỏe", "cầu thủ"] },
    { cat: 2, title: "Hướng dẫn sử dụng hệ thống BXH và đăng ký giải trên 6v6.vn", excerpt: "Bài viết hướng dẫn chi tiết cách sử dụng website 6v6 Vietnam, từ đăng ký tài khoản đến xem BXH.", tags: ["hướng dẫn", "website", "BXH"] },
];

const sampleContent = (title: string, excerpt: string) => `
<p>${excerpt}</p>
<h2>Tổng quan</h2>
<p>Trong bối cảnh bóng đá phong trào Việt Nam ngày càng phát triển mạnh mẽ, ${title.toLowerCase()} đã trở thành chủ đề được cộng đồng quan tâm hàng đầu. Với sự tham gia của hàng nghìn cầu thủ từ khắp các tỉnh thành, giải đấu hứa hẹn mang đến những trận cầu đỉnh cao.</p>
<p>Ban tổ chức 6v6 Vietnam đã nỗ lực không ngừng để nâng cao chất lượng giải đấu, từ hệ thống trọng tài chuyên nghiệp đến cơ sở vật chất hiện đại. Đây là minh chứng cho sự phát triển vượt bậc của bóng đá phong trào tại Việt Nam.</p>
<h2>Chi tiết</h2>
<p>Theo thông tin từ ban tổ chức, mùa giải năm nay có nhiều điểm mới đáng chú ý. Đầu tiên, hệ thống BXH được cập nhật với thuật toán mới, đảm bảo tính công bằng và minh bạch hơn. Thứ hai, giải thưởng được nâng lên đáng kể so với các mùa trước.</p>
<blockquote>Chúng tôi cam kết mang đến trải nghiệm tốt nhất cho tất cả cầu thủ tham gia. Bóng đá phong trào xứng đáng được đầu tư nghiêm túc. — Ban tổ chức 6v6 Vietnam</blockquote>
<p>Ngoài ra, hệ thống đăng ký trực tuyến qua website 6v6.vn giúp các đội bóng dễ dàng đăng ký tham gia mà không cần thủ tục phức tạp. Mọi thông tin về lịch thi đấu, kết quả và BXH đều được cập nhật realtime trên nền tảng.</p>
<h2>Kết luận</h2>
<p>Hãy theo dõi 6v6 Vietnam để cập nhật những thông tin mới nhất. Chúng tôi sẽ tiếp tục đồng hành cùng cộng đồng bóng đá phong trào Việt Nam, mang đến những giải đấu chuyên nghiệp và hấp dẫn nhất.</p>
`;

// ─── Main ───

async function seed() {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected!\n");

    // Find an admin/manager user to use as author
    const UserModel = mongoose.connection.collection("users");
    let author = await UserModel.findOne({ role: "admin" });
    if (!author) author = await UserModel.findOne({ role: "manager" });
    if (!author) author = await UserModel.findOne({});

    if (!author) {
        console.error("❌ No user found in database. Please create a user first.");
        process.exit(1);
    }
    console.log(`📝 Using author: ${author.name} (${author.email})\n`);

    // 1. Seed categories
    console.log("📂 Seeding categories...");
    const categoryIds: mongoose.Types.ObjectId[] = [];
    for (const cat of categoriesData) {
        const result = await Category.findOneAndUpdate(
            { slug: cat.slug },
            { ...cat, isActive: true },
            { upsert: true, new: true, returnDocument: "after" }
        );
        categoryIds.push(result._id as mongoose.Types.ObjectId);
        console.log(`   ✅ ${cat.name} (${result._id})`);
    }

    // 2. Seed posts
    console.log("\n📰 Seeding 20 posts...");
    let created = 0;
    for (let i = 0; i < postsData.length; i++) {
        const p = postsData[i];
        const slug = slugify(p.title);
        const existing = await Post.findOne({ slug });
        if (existing) {
            console.log(`   ⏭  Skipped (exists): ${p.title.substring(0, 50)}...`);
            continue;
        }

        const publishedAt = randomDate(30);
        await Post.create({
            title: p.title,
            slug,
            excerpt: p.excerpt,
            content: sampleContent(p.title, p.excerpt),
            coverImage: "",
            category: categoriesData[p.cat].slug,
            categoryRef: categoryIds[p.cat],
            tags: p.tags,
            author: author._id,
            status: "published",
            isPinned: p.pinned || false,
            isFeatured: p.featured || false,
            views: randomInt(50, 2000),
            readingTime: randomInt(2, 8),
            publishedAt,
        });
        created++;
        console.log(`   ✅ [${categoriesData[p.cat].name}] ${p.title.substring(0, 55)}...`);
    }

    // 3. Update category post counts
    for (let i = 0; i < categoryIds.length; i++) {
        const count = await Post.countDocuments({ categoryRef: categoryIds[i], status: "published" });
        await Category.findByIdAndUpdate(categoryIds[i], { postCount: count });
    }

    console.log(`\n🎉 Done! Created ${created} posts across ${categoryIds.length} categories.`);
    await mongoose.disconnect();
    console.log("🔌 Disconnected.");
}

seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
});
