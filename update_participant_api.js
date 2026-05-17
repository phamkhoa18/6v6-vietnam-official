const fs = require('fs');

const routePath = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/api/tournaments/[id]/participants/route.ts';
let code = fs.readFileSync(routePath, 'utf8');

const postStart = code.indexOf('// POST /api/tournaments/[id]/participants');
if (postStart !== -1) {
    code = code.substring(0, postStart); // Remove old POST method
}

const newPostMethod = `
// POST /api/tournaments/[id]/participants — Add a participant manually with Smart Roster
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
        const { name, shortName, logo, players } = body;

        if (!players || players.length === 0) {
            return NextResponse.json({ success: false, message: "Thiếu thông tin người chơi" }, { status: 400 });
        }

        // Process all players (create virtual accounts if needed)
        const processedUserIds = [];
        for (const p of players) {
            if (p.isNew) {
                // Quick create user
                const randomStr = Math.random().toString(36).substring(7);
                const virtualEmail = \`guest_\${Date.now()}_\${randomStr}@6v6.local\`;
                const hashedPassword = await bcrypt.hash(randomStr, 10);
                
                const newVirtualUser = await User.create({
                    name: p.name || "Khách",
                    email: virtualEmail,
                    password: hashedPassword,
                    phone: p.phone || "",
                    role: "user"
                });
                processedUserIds.push(newVirtualUser._id);
            } else {
                processedUserIds.push(p.userId);
            }
        }

        const captainId = processedUserIds[0];
        let newParticipant;

        if (tournament.gameMode === "1v1") {
            // 1v1 Mode
            newParticipant = await Registration.create({
                tournament: id,
                user: captainId,
                status: "active",
                registeredAt: new Date()
            });
            
            newParticipant = await Registration.findById(newParticipant._id)
                .populate("user", "name avatar nickname phone playerId")
                .lean();
        } else {
            // Team Modes (2v2, 3v3, 6v6)
            const members = processedUserIds.map((uid, idx) => ({
                user: uid,
                role: idx === 0 ? "captain" : "player",
                joinedAt: new Date()
            }));

            newParticipant = await Team.create({
                name,
                shortName: shortName?.toUpperCase() || name.substring(0,4).toUpperCase(),
                logo: logo || undefined,
                tournament: id,
                captain: captainId,
                members: members,
                status: "active" // Automatically approved
            });
            
            newParticipant = await Team.findById(newParticipant._id)
                .populate("captain", "name avatar nickname")
                .populate("members.user", "name avatar nickname playerId phone")
                .lean();
        }

        // Update slots
        const activeCount = tournament.gameMode === "1v1"
            ? await Registration.countDocuments({ tournament: id, status: "active" })
            : await Team.countDocuments({ tournament: id, status: "active" });
        await Tournament.findByIdAndUpdate(id, { currentSlots: activeCount });

        return NextResponse.json({ success: true, data: { participant: newParticipant } });
    } catch (error: any) {
        return NextResponse.json({ success: false, message: error.message }, { status: 400 });
    }
}
`;

code += newPostMethod;
fs.writeFileSync(routePath, code, 'utf8');
console.log("Updated POST API.");
