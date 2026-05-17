const fs = require('fs');

const routePath = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/api/tournaments/[id]/participants/route.ts';
let code = fs.readFileSync(routePath, 'utf8');

if (!code.includes('export async function POST')) {
    const importUser = `import User from "@/models/User";\nimport bcrypt from "bcryptjs";`;
    if (!code.includes('import User')) {
        code = code.replace('import Registration from "@/models/Registration";', `import Registration from "@/models/Registration";\n${importUser}`);
    }

    const postMethod = `
// POST /api/tournaments/[id]/participants — Add a participant manually
export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;
        const currentUser = await getCurrentUser(req);
        
        if (!currentUser || (currentUser.role !== "admin" && currentUser.role !== "manager")) {
            return NextResponse.json({ success: false, message: "Không có quyền" }, { status: 403 });
        }

        const tournament = await Tournament.findById(id);
        if (!tournament) {
            return NextResponse.json({ success: false, message: "Không tìm thấy giải đấu" }, { status: 404 });
        }

        const body = await req.json();
        const { isTeam, name, shortName, captainName, phone, avatar, logo } = body;

        let virtualUserId;
        
        // Always create a virtual user for manual additions if no real user is linked
        const randomStr = Math.random().toString(36).substring(7);
        const virtualEmail = \`guest_\${Date.now()}_\${randomStr}@6v6.local\`;
        const hashedPassword = await bcrypt.hash(randomStr, 10);
        
        const newVirtualUser = await User.create({
            name: isTeam ? (captainName || name) : name,
            email: virtualEmail,
            password: hashedPassword,
            phone: phone || "",
            avatar: isTeam ? avatar : (avatar || logo),
            role: "user"
        });
        virtualUserId = newVirtualUser._id;

        let newParticipant;

        if (isTeam) {
            // Check if gameMode is Team
            if (tournament.gameMode === "1v1") {
                return NextResponse.json({ success: false, message: "Giải đấu 1v1 không thể thêm đội bóng" }, { status: 400 });
            }
            
            newParticipant = await Team.create({
                name,
                shortName: shortName?.toUpperCase() || name.substring(0,4).toUpperCase(),
                logo: logo || avatar,
                tournament: id,
                captain: virtualUserId,
                members: [{
                    user: virtualUserId,
                    role: "captain",
                    joinedAt: new Date()
                }],
                status: "active" // Automatically approved
            });
            
            newParticipant = await Team.findById(newParticipant._id)
                .populate("captain", "name avatar nickname")
                .populate("members.user", "name avatar nickname")
                .lean();
        } else {
            // 1v1 Mode
            if (tournament.gameMode !== "1v1") {
                return NextResponse.json({ success: false, message: "Giải đấu Đội không thể thêm Cầu thủ đơn" }, { status: 400 });
            }
            
            newParticipant = await Registration.create({
                tournament: id,
                user: virtualUserId,
                status: "active",
                registeredAt: new Date()
            });
            
            newParticipant = await Registration.findById(newParticipant._id)
                .populate("user", "name avatar nickname phone")
                .lean();
        }

        // Update slots
        const activeCount = isTeam
            ? await Team.countDocuments({ tournament: id, status: "active" })
            : await Registration.countDocuments({ tournament: id, status: "active" });
        await Tournament.findByIdAndUpdate(id, { currentSlots: activeCount });

        return NextResponse.json({ success: true, data: { participant: newParticipant } });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
`;
    code += postMethod;
    fs.writeFileSync(routePath, code, 'utf8');
    console.log("Added POST method to API.");
} else {
    console.log("POST method already exists.");
}
