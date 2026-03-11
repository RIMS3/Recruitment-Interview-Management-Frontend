const API_URL = `${import.meta.env.VITE_API_BASE_URL}/employer-applications`;

const getAuthHeader = () => {
  // SỬA: Đổi "token" thành "accessToken" cho khớp với LoginForm
  const token = localStorage.getItem("accessToken"); 
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

export const applicationApi = {
  getList: async ({ searchTitle = "", status = "" }) => {
    let queryParams = new URLSearchParams();
    if (searchTitle) queryParams.append("searchTitle", searchTitle);
    if (status !== "") queryParams.append("status", status);

    const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
      method: "GET",
      headers: {
        ...getAuthHeader(),
        "Content-Type": "application/json"
      }
    });

    if (!response.ok) {
      if (response.status === 401) throw new Error("Phiên đăng nhập hết hạn");
      throw new Error("Không thể lấy danh sách");
    }
    return response.json();
  },

  updateStatus: async (appId, newStatus) => {
    const response = await fetch(`${API_URL}/${appId}/status`, {
      method: "PATCH",
      headers: { 
        "Content-Type": "application/json",
        ...getAuthHeader() // Thêm Token vào đây
      },
      body: JSON.stringify({ newStatus })
    });

    return response.ok;
  },

  getCvIdByApplication: async (applicationId) => {
    const response = await fetch(
      `${API_URL}/${applicationId}/cv`, // Sửa lại URL cho khớp với Controller
      {
        headers: getAuthHeader() // Thêm Token vào đây
      }
    );

    if (!response.ok) {
      throw new Error("Không lấy được CV ID");
    }

    return response.json();
  }
};