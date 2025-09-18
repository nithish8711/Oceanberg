const API_URL = 'http://localhost:8080/api/alerts';

export const fetchAllAlerts = async () => {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching all alerts:", error);
        throw error;
    }
};

export const searchAlerts = async (filters) => {
    try {
        const params = new URLSearchParams();

        if (filters.type) {
            params.append('type', filters.type);
        }
        if (filters.districtOrState) {
            params.append('districtOrState', filters.districtOrState);
        }
        if (filters.color) {
            params.append('color', filters.color);
        }

        // ✅ Correctly handle date range by appending time to the YYYY-MM-DD string
        if (filters.startDate) {
            params.append('startDate', `${filters.startDate}T00:00:00`);
        }
        if (filters.endDate) {
            params.append('endDate', `${filters.endDate}T23:59:59`);
        }

        const url = `${API_URL}/search?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error searching alerts:", error);
        throw error;
    }
};