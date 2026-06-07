const BASE_URL = "http://localhost:8080";

// Helper to make API calls
async function apiCall(url, options = {}) {
    const fullUrl = `${BASE_URL}${url}`;
    const defaultHeaders = { "Content-Type": "application/json" };

    try {
        const response = await fetch(fullUrl, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || "API call failed");
        }
        return data;
    } catch (error) {
        throw error;
    }
}

// Product Admin APIs
async function getPendingProducts() {
    return apiCall("/admin/products/pending");
}

async function getProductById(productId) {
    return apiCall(`/admin/products/${productId}`);
}

async function approveProduct(productId, reason = null) {
    return apiCall(`/admin/products/${productId}/approve`, {
        method: "POST",
        body: reason ? JSON.stringify({ reason }) : JSON.stringify({})
    });
}

async function rejectProduct(productId, reason = null) {
    return apiCall(`/admin/products/${productId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason })
    });
}

// Category APIs
async function getCategories() {
    return apiCall("/admin/categories");
}

async function createCategory(categoryData) {
    return apiCall("/admin/categories", {
        method: "POST",
        body: JSON.stringify(categoryData)
    });
}

async function addCategoryAttribute(attributeData) {
    return apiCall("/admin/categories/attributes", {
        method: "POST",
        body: JSON.stringify(attributeData)
    });
}

// Contract APIs
async function getContracts() {
    return apiCall("/admin/contracts");
}
