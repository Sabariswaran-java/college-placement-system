const API_BASE = "http://localhost:8080/placementx-backend/api";

export const PlacementAPI = {
    async getCompanies() {
        const res = await fetch(`${API_BASE}/companies`);
        return res.json();
    },
    async saveCompany(data) {
        const params = new URLSearchParams(data);
        const res = await fetch(`${API_BASE}/companies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });
        return res.json();
    },
    async deleteCompany(id) {
        const res = await fetch(`${API_BASE}/companies?id=${id}`, { method: 'DELETE' });
        return res.json();
    },
    async getStudents() {
        const res = await fetch(`${API_BASE}/students`);
        return res.json();
    },
    async getApplications() {
        const res = await fetch(`${API_BASE}/applications`);
        return res.json();
    },
    async getRecords() {
        const res = await fetch(`${API_BASE}/records`);
        return res.json();
    }
};