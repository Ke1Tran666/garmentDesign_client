import httpClient from "@/shared/api/httpClient";

export const serviceOrderApi = {
  async getMine(config = {}) {
    const response = await httpClient.get("/service-orders/me", config);

    return response.data;
  },

  async create(payload) {
    const response = await httpClient.post("/service-orders/me", payload);

    return response.data;
  },

  async remove(orderId) {
    const response = await httpClient.delete(`/service-orders/me/${orderId}`);

    return response.data;
  },

  async update(orderId, payload) {
    const response = await httpClient.patch(
      `/service-orders/me/${orderId}`,
      payload,
    );

    return response.data;
  },

  async updateAddress(orderId, addressId) {
    const response = await httpClient.patch(
      `/service-orders/me/${orderId}/address`,
      {
        addressId,
      },
    );

    return response.data;
  },

  async getAll(config = {}) {
    const response = await httpClient.get("/service-orders", config);

    return response.data;
  },

  async getById(orderId, config = {}) {
    const response = await httpClient.get(`/service-orders/${orderId}`, config);

    return response.data;
  },

  async removeByAdmin(orderId, config = {}) {
    await httpClient.delete(`/service-orders/${orderId}`, config);
  },
};
