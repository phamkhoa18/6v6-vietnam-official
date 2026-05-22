/**
 * Ranking Points System — 6v6 Vietnam
 *
 * Cách tính điểm mỗi trận:
 * - Thắng trong thời gian chính: 3 điểm
 * - Hòa → Thắng penalty: 2 điểm
 * - Hòa → Thua penalty: 1 điểm
 * - Thua trong thời gian chính: 0 điểm
 *
 * BXH = Tổng điểm tất cả trận qua mọi giải đấu (cùng gameMode)
 */

// Default scoring config
export const DEFAULT_SCORING = {
    pointsPerWin: 3,
    pointsPerDraw: 1,
    pointsPerPenaltyWin: 2,
    pointsPerPenaltyLoss: 1,
    pointsPerLoss: 0,
};

// Game modes
export const GAME_MODES = ["1v1", "2v2", "3v3", "6v6"] as const;
export type GameMode = (typeof GAME_MODES)[number];

// Game mode display info
export const GAME_MODE_INFO: Record<
    GameMode,
    { label: string; description: string; rankBy: "individual" | "team"; displayAs: "individual" | "team" }
> = {
    "1v1": {
        label: "1 vs 1",
        description: "Cá nhân đối kháng",
        rankBy: "individual",
        displayAs: "individual",
    },
    "2v2": {
        label: "2 vs 2",
        description: "Cặp đôi",
        rankBy: "individual",
        displayAs: "individual",
    },
    "3v3": {
        label: "3 vs 3",
        description: "Nhóm 3 người",
        rankBy: "individual",
        displayAs: "individual",
    },
    "6v6": {
        label: "6 vs 6",
        description: "Đội hình đầy đủ",
        rankBy: "team",
        displayAs: "team",
    },
};

// Tournament formats
export const TOURNAMENT_FORMATS = {
    single_elimination: "Loại trực tiếp",
    round_robin: "Vòng tròn",
    group_stage: "Vòng bảng",
} as const;

// Tournament status
export const TOURNAMENT_STATUS = {
    draft: { label: "Nháp", color: "gray" },
    registration: { label: "Đang mở ĐK", color: "amber" },
    ongoing: { label: "Đang diễn ra", color: "red" },
    completed: { label: "Đã kết thúc", color: "emerald" },
    cancelled: { label: "Đã hủy", color: "red" },
} as const;

/**
 * Calculate match points for both sides.
 *
 * @param scoreA - Score of side A
 * @param scoreB - Score of side B
 * @param penaltyA - Penalty score of side A (only if draw)
 * @param penaltyB - Penalty score of side B (only if draw)
 * @param scoring - Custom scoring config (optional)
 * @returns { pointsA, pointsB, winner, resultType }
 */
export function calculateMatchPoints(
    scoreA: number,
    scoreB: number,
    penaltyA?: number,
    penaltyB?: number,
    scoring = DEFAULT_SCORING
): {
    pointsA: number;
    pointsB: number;
    winner: "A" | "B" | null;
    resultType: "regular" | "penalty" | "draw";
} {
    // Regular time win
    if (scoreA > scoreB) {
        return {
            pointsA: scoring.pointsPerWin,
            pointsB: scoring.pointsPerLoss,
            winner: "A",
            resultType: "regular",
        };
    }
    if (scoreB > scoreA) {
        return {
            pointsA: scoring.pointsPerLoss,
            pointsB: scoring.pointsPerWin,
            winner: "B",
            resultType: "regular",
        };
    }

    // Draw → Penalty
    if (penaltyA !== undefined && penaltyB !== undefined) {
        if (penaltyA > penaltyB) {
            return {
                pointsA: scoring.pointsPerPenaltyWin,
                pointsB: scoring.pointsPerPenaltyLoss,
                winner: "A",
                resultType: "penalty",
            };
        }
        return {
            pointsA: scoring.pointsPerPenaltyLoss,
            pointsB: scoring.pointsPerPenaltyWin,
            winner: "B",
            resultType: "penalty",
        };
    }

    // Draw without penalty — both get draw points
    return {
        pointsA: scoring.pointsPerDraw ?? 1,
        pointsB: scoring.pointsPerDraw ?? 1,
        winner: null,
        resultType: "draw",
    };
}

/**
 * Get team size for a game mode
 */
export function getTeamSize(mode: GameMode): number {
    const sizes: Record<GameMode, number> = {
        "1v1": 1,
        "2v2": 2,
        "3v3": 3,
        "6v6": 6,
    };
    return sizes[mode];
}

/**
 * Check if a game mode uses individual rankings
 */
export function isIndividualRanking(mode: GameMode): boolean {
    return GAME_MODE_INFO[mode].rankBy === "individual";
}
