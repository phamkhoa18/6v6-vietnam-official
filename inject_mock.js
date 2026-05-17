const fs = require('fs');

// 1. Inject into bxh/page.tsx
const bxh = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(main)/bxh/page.tsx';
let bxhCode = fs.readFileSync(bxh, 'utf8');

const mockPlayers = `
const MOCK_PLAYERS: Player[] = [
    { rank: 1, user: { _id: "1", name: "Nguyễn Văn A", avatar: "https://i.pravatar.cc/150?u=1", nickname: "Sát thủ bóng đêm", playerId: 1001 }, teamName: "Đà Nẵng FC", totalPoints: 1250, totalMatches: 15, tournamentsPlayed: 3, facebook: "https://facebook.com" },
    { rank: 2, user: { _id: "2", name: "Trần Văn B", avatar: "https://i.pravatar.cc/150?u=2", nickname: "Vua phá lưới", playerId: 1002 }, teamName: "Hà Nội eSports", totalPoints: 1100, totalMatches: 14, tournamentsPlayed: 3 },
    { rank: 3, user: { _id: "3", name: "Lê Thị C", avatar: "https://i.pravatar.cc/150?u=3", nickname: "Nữ hoàng", playerId: 1003 }, teamName: "Sài Gòn FC", totalPoints: 950, totalMatches: 12, tournamentsPlayed: 2 },
    { rank: 4, user: { _id: "4", name: "Phạm Văn D", nickname: "Kẻ hủy diệt", playerId: 1004 }, teamName: "Hải Phòng", totalPoints: 800, totalMatches: 10, tournamentsPlayed: 2 },
    { rank: 5, user: { _id: "5", name: "Vũ Văn E", avatar: "https://i.pravatar.cc/150?u=5", nickname: "Tốc độ ánh sáng", playerId: 1005 }, teamName: "Cần Thơ", totalPoints: 750, totalMatches: 9, tournamentsPlayed: 2 },
    { rank: 6, user: { _id: "6", name: "Hoàng Văn F", avatar: "https://i.pravatar.cc/150?u=6", nickname: "Ninja", playerId: 1006 }, teamName: "Vinh", totalPoints: 700, totalMatches: 8, tournamentsPlayed: 2 },
    { rank: 7, user: { _id: "7", name: "Đặng Văn G", avatar: "https://i.pravatar.cc/150?u=7", nickname: "Rồng trắng", playerId: 1007 }, teamName: "Huế", totalPoints: 650, totalMatches: 7, tournamentsPlayed: 2 },
];
`;

if (!bxhCode.includes('MOCK_PLAYERS')) {
    bxhCode = bxhCode.replace('export default function BXHPage() {', mockPlayers + '\nexport default function BXHPage() {');
    bxhCode = bxhCode.replace('setAllData(d.data?.rankings || []);', 'setAllData(d.data?.rankings?.length ? d.data.rankings : MOCK_PLAYERS);');
    fs.writeFileSync(bxh, bxhCode, 'utf8');
}

// 2. Inject into bxh-teams/page.tsx
const bxhTeams = '/Users/khoait/Documents/SourceCompany/6v6-vietnam-official/app/(main)/bxh-teams/page.tsx';
let bxhTeamsCode = fs.readFileSync(bxhTeams, 'utf8');

const mockTeams = `
const MOCK_TEAMS: TeamEntry[] = [
    { rank: 1, _id: "t1", teamName: "FC Phủi Hà Nội", captain: { name: "Nguyễn Tuấn Anh" }, totalPoints: 3400, logo: "https://ui-avatars.com/api/?name=HN&background=random" },
    { rank: 2, _id: "t2", teamName: "Đà Nẵng Dragons", captain: { name: "Lê Minh Trí" }, totalPoints: 3100, logo: "https://ui-avatars.com/api/?name=DN&background=random" },
    { rank: 3, _id: "t3", teamName: "Sài Gòn United", captain: { name: "Trần Thành Công" }, totalPoints: 2850, logo: "https://ui-avatars.com/api/?name=SG&background=random" },
    { rank: 4, _id: "t4", teamName: "FC Nghệ An", captain: { name: "Phan Văn Đức" }, totalPoints: 2400, logo: "https://ui-avatars.com/api/?name=NA&background=random" },
    { rank: 5, _id: "t5", teamName: "Thanh Hóa FC", captain: { name: "Hoàng Đình Tùng" }, totalPoints: 2100, logo: "https://ui-avatars.com/api/?name=TH&background=random" },
];
`;

if (!bxhTeamsCode.includes('MOCK_TEAMS')) {
    bxhTeamsCode = bxhTeamsCode.replace('export default function BXHTeamsPage() {', mockTeams + '\nexport default function BXHTeamsPage() {');
    bxhTeamsCode = bxhTeamsCode.replace('setAllData(d.data?.rankings || []);', 'setAllData(d.data?.rankings?.length ? d.data.rankings : MOCK_TEAMS);');
    fs.writeFileSync(bxhTeams, bxhTeamsCode, 'utf8');
}

console.log("Injected mock data");
