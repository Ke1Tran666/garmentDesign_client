import httpClient from "./httpClient";

export const serviceReviewApi = {
  async getReviewableOrders(
    userId,
    config = {},
  ) {
    const response = await httpClient.get(
      `/service-reviews/user/${userId}/orders`,
      config,
    );

    return response.data;
  },

  async getByUser(
    userId,
    config = {},
  ) {
    const response = await httpClient.get(
      `/service-reviews/user/${userId}`,
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

  async create(
    orderId,
    userId,
    payload,
  ) {
    const response = await httpClient.post(
      `/service-reviews/order/${orderId}/user/${userId}`,
      payload,
    );

    return response.data;
  },

  async update(
    reviewId,
    userId,
    payload,
  ) {
    const response = await httpClient.put(
      `/service-reviews/${reviewId}/user/${userId}`,
      payload,
    );

    return response.data;
  },

  async remove(
    reviewId,
    userId,
  ) {
    await httpClient.delete(
      `/service-reviews/${reviewId}/user/${userId}`,
    );
  },
};