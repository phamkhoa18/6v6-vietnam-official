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
};

export const adminAPI = {
    getStats: () => fetchAPI("/admin/stats"),
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

export const tournamentAPI = {
    create: (data: any) => fetchAPI("/tournaments", { method: "POST", body: JSON.stringify(data) }),
    // To be expanded
};
