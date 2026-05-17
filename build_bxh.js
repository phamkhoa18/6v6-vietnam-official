const fs = require('fs');
const path = require('path');

const srcEfootcupBxh = '/Users/khoait/Documents/SourceCompany/efootcup/app/(main)/bxh/page.tsx';
const srcEfootcupBxhTeams = '/Users/khoait/Documents/SourceCompany/efootcup/app/(main)/bxh-teams/page.tsx';

const targetBxh = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(main)/bxh/page.tsx';
const targetBxhTeamsDir = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(main)/bxh-teams';
const targetBxhTeams = path.join(targetBxhTeamsDir, 'page.tsx');

if (!fs.existsSync(targetBxhTeamsDir)) fs.mkdirSync(targetBxhTeamsDir, { recursive: true });

// 1. Build /bxh/page.tsx
let bxhCode = fs.readFileSync(srcEfootcupBxh, 'utf8');

// Replace imports
bxhCode = bxhCode.replace('import { PLACEMENT_LABELS, EFV_TIER_WINDOWS } from "@/lib/efv-points";', '');
// Remove history types
bxhCode = bxhCode.replace(/type PointLog = \{[\s\S]*?\} \| null;/g, '');

// The data structure returned by /api/rankings is:
// rank, user (object with name, avatar, nickname, playerId), teamName, totalPoints, totalMatches, totalWins, tournamentsPlayed
bxhCode = bxhCode.replace('type Player = {', `type Player = {
    rank: number;
    user?: {
        _id: string;
        name: string;
        avatar?: string;
        nickname?: string;
        playerId?: number;
    };
    teamName?: string;
    totalPoints: number;
    totalMatches: number;
    tournamentsPlayed: number;`);

// Find the component start
const componentStartIdx = bxhCode.indexOf('export default function BXHPage() {');
let beforeComponent = bxhCode.substring(0, componentStartIdx);
let componentBody = bxhCode.substring(componentStartIdx);

// Add tabs state
const tabsState = `    const [activeMode, setActiveMode] = useState<"1v1" | "2v2" | "3v3">("1v1");
`;
componentBody = componentBody.replace('const [allData, setAllData] = useState<Player[]>([]);', `const [allData, setAllData] = useState<Player[]>([]);\n${tabsState}`);

// Replace fetch logic
const oldFetch = `    useEffect(() => {
        fetch("/api/bxh?mode=mobile")
            .then((r) => r.json())
            .then((d) => {
                if (d.success !== false) {
                    setAllData(d.data?.data || []);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);`;

const newFetch = `    useEffect(() => {
        setLoading(true);
        fetch(\`/api/rankings?mode=\${activeMode}&limit=1000\`)
            .then((r) => r.json())
            .then((d) => {
                if (d.success !== false) {
                    setAllData(d.data?.rankings || []);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, [activeMode]);`;

componentBody = componentBody.replace(oldFetch, newFetch);

// Fix filter logic
const oldFilter = `        return allData.filter((p) =>
            String(p.name).toLowerCase().includes(q) ||
            String(p.nickname || "").toLowerCase().includes(q) ||
            String(p.team || "").toLowerCase().includes(q) ||
            String(p.id).toLowerCase().includes(q)
        );`;
const newFilter = `        return allData.filter((p) =>
            String(p.user?.name || "").toLowerCase().includes(q) ||
            String(p.user?.nickname || "").toLowerCase().includes(q) ||
            String(p.teamName || "").toLowerCase().includes(q) ||
            String(p.user?.playerId || "").toLowerCase().includes(q)
        );`;
componentBody = componentBody.replace(oldFilter, newFilter);

// Inject Tabs UI after Hero
const tabsUI = `
            {/* ═══ TABS ═══ */}
            <div className="flex justify-center -mt-8 relative z-30 mb-8">
                <div className="inline-flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-2xl">
                    {["1v1", "2v2", "3v3"].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setActiveMode(mode as any)}
                            className={\`px-8 py-3 rounded-xl font-bold transition-all duration-300 \${
                                activeMode === mode
                                    ? "bg-gradient-to-r from-amber-400 to-amber-600 text-white shadow-lg shadow-amber-500/30"
                                    : "text-white/70 hover:text-white hover:bg-white/10"
                            }\`}
                        >
                            {mode.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>
`;
componentBody = componentBody.replace('{/* ═══ TOP 3 PODIUM — solid bright cards ═══ */}', tabsUI + '\n            {/* ═══ TOP 3 PODIUM — solid bright cards ═══ */}');

// Remove history modal logic and UI
const openHistoryStart = componentBody.indexOf('// History modal');
const openHistoryEnd = componentBody.indexOf('const pageRange', openHistoryStart);
if (openHistoryStart !== -1 && openHistoryEnd !== -1) {
    componentBody = componentBody.substring(0, openHistoryStart) + componentBody.substring(openHistoryEnd);
}

const historyModalStart = componentBody.indexOf('{/* ═══ HISTORY MODAL ═══ */}');
if (historyModalStart !== -1) {
    componentBody = componentBody.substring(0, historyModalStart) + '        </div>\n    );\n}';
}

// Fix mapping in the UI
componentBody = componentBody.replace(/p\.avatar/g, 'p.user?.avatar');
componentBody = componentBody.replace(/p\.name/g, 'p.user?.name');
componentBody = componentBody.replace(/p\.nickname/g, 'p.user?.nickname');
componentBody = componentBody.replace(/p\.team/g, 'p.teamName');
componentBody = componentBody.replace(/p\.points/g, 'p.totalPoints');
componentBody = componentBody.replace(/p\.id/g, 'p.user?.playerId');
componentBody = componentBody.replace(/p\._id/g, 'p.user?._id');

// Write to /bxh/page.tsx
fs.writeFileSync(targetBxh, beforeComponent + componentBody, 'utf8');

// 2. Build /bxh-teams/page.tsx
let bxhTeamsCode = fs.readFileSync(srcEfootcupBxhTeams, 'utf8');

bxhTeamsCode = bxhTeamsCode.replace('type TeamEntry = {', `type TeamEntry = {
    rank: number;
    teamName: string;
    totalPoints: number;
    logo?: string;
    captain?: { name: string };`);

const teamComponentStartIdx = bxhTeamsCode.indexOf('export default function BXHTeamsPage() {');
let beforeTeam = bxhTeamsCode.substring(0, teamComponentStartIdx);
let teamComponentBody = bxhTeamsCode.substring(teamComponentStartIdx);

const oldTeamFetch = `    useEffect(() => {
        fetch("/api/bxh-teams")
            .then((r) => r.json())
            .then((d) => {
                if (d.success !== false) {
                    const raw = d.data?.data || [];
                    const sorted = [...raw].sort((a: any, b: any) => (Number(b.point) || 0) - (Number(a.point) || 0));
                    sorted.forEach((t: any, i: number) => { t.rank = i + 1; });
                    setAllData(sorted);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);`;

const newTeamFetch = `    useEffect(() => {
        setLoading(true);
        fetch("/api/rankings?mode=6v6&limit=1000")
            .then((r) => r.json())
            .then((d) => {
                if (d.success !== false) {
                    setAllData(d.data?.rankings || []);
                }
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);`;

teamComponentBody = teamComponentBody.replace(oldTeamFetch, newTeamFetch);

const oldTeamFilter = `        return allData.filter((t) =>
            String(t.clubName).toLowerCase().includes(q) ||
            String(t.leader || "").toLowerCase().includes(q)
        );`;
const newTeamFilter = `        return allData.filter((t) =>
            String(t.teamName).toLowerCase().includes(q) ||
            String(t.captain?.name || "").toLowerCase().includes(q)
        );`;
teamComponentBody = teamComponentBody.replace(oldTeamFilter, newTeamFilter);

// Fix property access
teamComponentBody = teamComponentBody.replace(/t\.clubName/g, 't.teamName');
teamComponentBody = teamComponentBody.replace(/t\.leader/g, 't.captain?.name');
teamComponentBody = teamComponentBody.replace(/t\.point/g, 't.totalPoints');

fs.writeFileSync(targetBxhTeams, beforeTeam + teamComponentBody, 'utf8');

console.log("Successfully replaced BXH and BXH-Teams");
