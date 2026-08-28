import httpClient from "@/shared/api/httpClient";

export const serviceReviewApi = {
  async getReviewableOrders(config = {}) {
    const response = await httpClient.get(
      "/service-reviews/me/orders",
      config,
    );

    return response.data;
  },

  async getMine(config = {}) {
    const response = await httpClient.get(
      "/service-reviews/me",
      config,
    );

    return response.data;
  },

  async getPublic(config = {}) {
    const response = await httpClient.get(
      "/service-reviews/public",
      config,
    );

    return response.data;
  },

  async create(orderId, payload) {
    const response = await httpClient.post(
      `/service-reviews/me/orders/${orderId}`,
      payload,
    );

    return response.data;
  },

  async update(reviewId, payload) {
    const response = await httpClient.put(
      `/service-reviews/me/${reviewId}`,
      payload,
    );

    return response.data;
  },

  async remove(reviewId) {
    await httpClient.delete(
      `/service-reviews/me/${reviewId}`,
    );
  },
};
