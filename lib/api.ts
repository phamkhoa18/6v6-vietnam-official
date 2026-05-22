const API_BASE = "/api";

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    if (typeof window !== "undefined") {
        const savedToken = localStorage.getItem("6v6_token");
        if (savedToken) {
            options.headers = { ...options.headers, Authorization: `Bearer ${savedToken}` };
        }
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    const data = await res.json();
    return data;
}

export const dashboardAPI = {
    getStats: () => fetchAPI("/manager/dashboard"),
    getPlayers: () => fetchAPI("/manager/players"),
    getReports: () => fetchAPI("/manager/reports"),
};

export const adminAPI = {
    getStats: () => fetchAPI("/admin/stats"),
    // Users CRUD
    getUsers: (params?: Record<string, string>) => {
        const searchParams = new URLSearchParams(params || {});
        return fetchAPI(`/admin/users?${searchParams.toString()}`);
    },
    updateUser: (userId: string, data: any) =>
        fetchAPI(`/admin/users/${userId}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteUser: (userId: string) =>
        fetchAPI(`/admin/users/${userId}`, { method: "DELETE" }),
    createUser: (data: any) =>
        fetchAPI("/admin/users", { method: "POST", body: JSON.stringify(data) }),
    // Admin Tournament Management
    getTournaments: (params?: Record<string, string>) => {
        const searchParams = new URLSearchParams(params || {});
        return fetchAPI(`/admin/tournaments?${searchParams.toString()}`);
    },
    updateTournament: (id: string, data: any) =>
        fetchAPI(`/admin/tournaments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    deleteTournament: (id: string) =>
        fetchAPI(`/admin/tournaments/${id}`, { method: "DELETE" }),
    // Posts / Content
    getPosts: (params?: Record<string, string>) => {
        const searchParams = new URLSearchParams(params || {});
        return fetchAPI(`/admin/content?${searchParams.toString()}`);
    },
    getPost: (id: string) => fetchAPI(`/admin/content/${id}`),
    createPost: (data: any) => fetchAPI("/admin/content", { method: "POST", body: JSON.stringify(data) }),
    updatePost: (postId: string, data: any) => fetchAPI(`/admin/content/${postId}`, { method: "PUT", body: JSON.stringify(data) }),
    deletePost: (postId: string) => fetchAPI(`/admin/content/${postId}`, { method: "DELETE" }),
    uploadContentImage: async (file: File, type: string = "content") => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        const headers: Record<string, string> = {};
        if (typeof window !== "undefined") {
            const savedToken = localStorage.getItem("6v6_token");
            if (savedToken) headers.Authorization = `Bearer ${savedToken}`;
        }
        const res = await fetch("/api/admin/content/upload", {
            method: "POST",
            headers,
            body: formData,
        });
        return res.json();
    },

    // Categories
    getCategories: () => fetchAPI("/admin/categories"),
    createCategory: (data: any) => fetchAPI("/admin/categories", { method: "POST", body: JSON.stringify(data) }),
    updateCategory: (categoryId: string, data: any) => fetchAPI("/admin/categories", { method: "PUT", body: JSON.stringify({ categoryId, ...data }) }),
    deleteCategory: (categoryId: string) => fetchAPI("/admin/categories", { method: "DELETE", body: JSON.stringify({ categoryId }) }),

    // Menus
    getMenus: () => fetchAPI("/admin/menus"),
    updateMenu: (location: string, items: any[]) => fetchAPI("/admin/menus", { method: "PUT", body: JSON.stringify({ location, items }) }),

    // Settings
    getSettings: () => fetchAPI("/admin/settings"),
    updateSettings: (data: any) => fetchAPI("/admin/settings", { method: "PUT", body: JSON.stringify(data) }),
    uploadSettingsImage: async (file: File, type: string) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);
        const headers: Record<string, string> = {};
        if (typeof window !== "undefined") {
            const savedToken = localStorage.getItem("6v6_token");
            if (savedToken) headers.Authorization = `Bearer ${savedToken}`;
        }
        const res = await fetch("/api/admin/settings/upload", {
            method: "POST",
            headers,
            body: formData,
        });
        return res.json();
    },
};

// ====== General Upload (for user-facing uploads: avatar, screenshot, payment_proof, etc.) ======
export const uploadImage = async (file: File, type: string = "general") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);
    const headers: Record<string, string> = {};
    if (typeof window !== "undefined") {
        const savedToken = localStorage.getItem("6v6_token");
        if (savedToken) headers.Authorization = `Bearer ${savedToken}`;
    }
    const res = await fetch("/api/upload", {
        method: "POST",
        headers,
        body: formData,
    });
    return res.json();
};

export const tournamentAPI = {
    create: (data: any) => fetchAPI("/tournaments", { method: "POST", body: JSON.stringify(data) }),
    getById: (id: string) => fetchAPI(`/tournaments/${id}`),
    getMyTournaments: (params?: Record<string, string>) => {
        const searchParams = new URLSearchParams(params || {});
        return fetchAPI(`/manager/tournaments?${searchParams.toString()}`);
    },
    update: (id: string, data: any) => fetchAPI(`/tournaments/${id}`, { method: "PUT", body: JSON.stringify(data) }),
    delete: (id: string) => fetchAPI(`/tournaments/${id}`, { method: "DELETE" }),
    updateStatus: (id: string, status: string) => fetchAPI(`/tournaments/${id}`, { method: "PUT", body: JSON.stringify({ status }) }),

    // Teams
    getTeams: (tournamentId: string) =>
        fetchAPI(`/tournaments/${tournamentId}/teams`),
    updateTeamSeed: (tournamentId: string, data: any) =>
        fetchAPI(`/tournaments/${tournamentId}/teams`, { method: "PUT", body: JSON.stringify(data) }),

    // Bracket generation
    generateBrackets: (id: string, options?: any) =>
        fetchAPI(`/tournaments/${id}/draw`, { method: "POST", body: JSON.stringify(options || {}) }),

    // Brackets
    getBrackets: (tournamentId: string) =>
        fetchAPI(`/tournaments/${tournamentId}/matches?limit=500`),

    swapBracketPositions: (tournamentId: string, team1Id: string, team2Id: string) =>
        fetchAPI(`/tournaments/${tournamentId}/brackets/swap`, {
            method: "PUT",
            body: JSON.stringify({ team1Id, team2Id }),
        }),

    // Matches
    getMatches: (tournamentId: string) =>
        fetchAPI(`/tournaments/${tournamentId}/matches`),
    updateMatch: (tournamentId: string, data: any) =>
        fetchAPI(`/tournaments/${tournamentId}/matches`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    // Registrations (manager)
    getRegistrations: (id: string, params?: Record<string, string>) => {
        const searchParams = new URLSearchParams(params || {});
        return fetchAPI(`/tournaments/${id}/registrations?${searchParams.toString()}`);
    },
    handleRegistration: (id: string, data: any) =>
        fetchAPI(`/tournaments/${id}/registrations`, { method: "PATCH", body: JSON.stringify(data) }),
    importRegistrations: (id: string, data: any[]) =>
        fetchAPI(`/tournaments/${id}/registrations/import`, { method: "POST", body: JSON.stringify({ registrations: data }) }),
    updateRegistrationStatus: (tournamentId: string, registrationId: string, newStatus: string, reason?: string) =>
        fetchAPI(`/tournaments/${tournamentId}/registrations`, {
            method: "PUT",
            body: JSON.stringify({ action: "update_status", registrationId, newStatus, reason }),
        }),
    deleteRegistration: (tournamentId: string, registrationId: string) =>
        fetchAPI(`/tournaments/${tournamentId}/registrations?registrationId=${registrationId}`, { method: "DELETE" }),

    // Expenses
    getExpenses: (tournamentId: string) =>
        fetchAPI(`/tournaments/${tournamentId}/expenses`),
    addExpense: (tournamentId: string, data: any) =>
        fetchAPI(`/tournaments/${tournamentId}/expenses`, { method: "POST", body: JSON.stringify(data) }),
    updateExpense: (tournamentId: string, data: any) =>
        fetchAPI(`/tournaments/${tournamentId}/expenses`, { method: "PUT", body: JSON.stringify(data) }),
    deleteExpense: (tournamentId: string, expenseId: string) =>
        fetchAPI(`/tournaments/${tournamentId}/expenses?expenseId=${expenseId}`, { method: "DELETE" }),

    // Collaborators
    getCollaborators: (tournamentId: string) =>
        fetchAPI(`/tournaments/${tournamentId}/collaborators`),
    generateInviteCode: (tournamentId: string) =>
        fetchAPI(`/tournaments/${tournamentId}/collaborators/invite`, { method: "POST" }),
    regenerateInviteCode: (tournamentId: string) =>
        fetchAPI(`/tournaments/${tournamentId}/collaborators/invite`, { method: "PUT" }),
    removeCollaborator: (tournamentId: string, userId: string) =>
        fetchAPI(`/tournaments/${tournamentId}/collaborators/${userId}`, { method: "DELETE" }),

    // Feedback
    getFeedback: (tournamentId: string) =>
        fetchAPI(`/tournaments/${tournamentId}/feedback`),
    submitFeedback: (tournamentId: string, data: any) =>
        fetchAPI(`/tournaments/${tournamentId}/feedback`, { method: "POST", body: JSON.stringify(data) }),

    // Payment status (stub — payment disabled in 6v6-vietnam)
    updatePaymentStatus: (_tournamentId: string, _registrationId: string, _newPaymentStatus: string, _paymentAmount?: number) =>
        Promise.resolve({ success: false, message: "Payment disabled", data: null }),

    // Audit log
    getMatchAuditLog: (tournamentId: string, params?: Record<string, string>) => {
        const searchParams = new URLSearchParams(params || {});
        return fetchAPI(`/tournaments/${tournamentId}/audit?${searchParams.toString()}`);
    },
};

// ====== Payment Config ======
export const paymentConfigAPI = {
    getConfig: () => fetchAPI("/admin/payment-config"),
    updateConfig: (data: any) =>
        fetchAPI("/admin/payment-config", {
            method: "PUT",
            body: JSON.stringify(data),
        }),
    getPublicConfig: () => fetchAPI("/payment-config"),
    uploadQR: async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "payment_qr");
        const headers: Record<string, string> = {};
        if (typeof window !== "undefined") {
            const savedToken = localStorage.getItem("6v6_token");
            if (savedToken) headers.Authorization = `Bearer ${savedToken}`;
        }
        const res = await fetch("/api/admin/settings/upload", {
            method: "POST",
            headers,
            body: formData,
        });
        return res.json();
    },
};

// ====== Payment API (stub — payment disabled in 6v6-vietnam) ======
const _paymentDisabled = () => Promise.resolve({ success: false, message: "Payment disabled", data: null });
export const tournamentPaymentAPI = {
    confirmPayment: (_tournamentId: string, _registrationId: string) => _paymentDisabled(),
    rejectPayment: (_tournamentId: string, _registrationId: string) => _paymentDisabled(),
    createPayment: (_tournamentId: string, _methodId: string) => _paymentDisabled(),
    submitProof: (_tournamentId: string, _data: any) => _paymentDisabled(),
    verifyPayment: (_tournamentId: string, _status: string) => _paymentDisabled(),
};
