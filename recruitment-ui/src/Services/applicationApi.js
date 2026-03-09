// Thay đổi: Sử dụng biến môi trường và nối thêm endpoint cụ thể
const API_URL = `${import.meta.env.VITE_API_BASE_URL}/employer-applications`;

export const applicationApi = {
  getList: async ({ companyId, searchTitle = "", status = "" }) => {
    let queryParams = new URLSearchParams();

    if (companyId) {
      queryParams.append("companyId", companyId);
    }

    if (searchTitle) {
      queryParams.append("searchTitle", searchTitle);
    }

    if (status !== "") {
      queryParams.append("status", status);
    }

    const response = await fetch(`${API_URL}?${queryParams.toString()}`);

    if (!response.ok) {
      throw new Error("Không thể lấy danh sách");
    }

    return response.json();
  },

  updateStatus: async (appId, newStatus) => {
    const response = await fetch(`${API_URL}/${appId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newStatus })
    });

    return response.ok;
  }
};