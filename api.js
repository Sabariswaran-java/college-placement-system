const API_BASE = 'https://placement-backend-api.onrender.com/placementx-backend/api';

const PlacementAPI = {
    async getCompanies() {
        try {
            const res = await fetch(`${API_BASE}/companies`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.warn("API Warning (getCompanies):", err);
            return [];
        }
    },
    async saveCompany(data) {
        try {
            const params = new URLSearchParams(data);
            const res = await fetch(`${API_BASE}/companies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params
            });
            return await res.json();
        } catch (err) {
            console.warn("API Warning (saveCompany):", err);
            return { status: "ERROR", message: "Failed to save company" };
        }
    },
    async deleteCompany(id) {
        try {
            const res = await fetch(`${API_BASE}/companies?id=${id}`, { method: 'DELETE' });
            return await res.json();
        } catch (err) {
            console.warn("API Warning (deleteCompany):", err);
            return { status: "ERROR", message: "Failed to delete company" };
        }
    },
    async getStudents() {
        try {
            const res = await fetch(`${API_BASE}/students`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.warn("API Warning (getStudents):", err);
            return [];
        }
    },
    async getApplications() {
        try {
            const res = await fetch(`${API_BASE}/applications`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.warn("API Warning (getApplications):", err);
            return [];
        }
    },
    async getRecords() {
        try {
            const res = await fetch(`${API_BASE}/records`);
            if (!res.ok) return [];
            return await res.json();
        } catch (err) {
            console.warn("API Warning (getRecords):", err);
            return [];
        }
    }
};

window.PlacementAPI = PlacementAPI;
