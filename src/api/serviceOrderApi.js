import httpClient from "./httpClient";

export const serviceOrderApi = {
  async getByUser(userId, config = {}) {
    const response = await httpClient.get(
      `/service-orders/user/${userId}`,
      config,
    );

    return response.data;
  },

  async create(payload) {
    const response = await httpClient.post(
      "/service-orders",
      payload,
    );

    return response.data;
  },

  async removeForUser(orderId, userId) {
    const response = await httpClient.delete(
      `/service-orders/${orderId}/user/${userId}`,
    );

    return response.data;
  },

  async updateForUser(
    orderId,
    userId,
    payload,
  ) {
    const response = await httpClient.patch(
      `/service-orders/${orderId}/user/${userId}`,
      payload,
    );

    return response.data;
  },

  async updateAddress(
    orderId,
    userId,
    addressId,
  ) {
    const response = await httpClient.patch(
      `/service-orders/${orderId}/user/${userId}/address`,
      {
        addressId,
      },
    );

    return response.data;
  },
};