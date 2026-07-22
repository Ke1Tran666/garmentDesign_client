import httpClient from "./httpClient";

export const serviceOrderFileApi = {
  async getAll(config = {}) {
    const response = await httpClient.get(
      "/service-order-files",
      config,
    );

    return response.data;
  },

  async getByOrder(orderId, config = {}) {
    const response = await httpClient.get(
      `/service-order-files/order/${orderId}`,
      config,
    );

    return response.data;
  },

  async upload(
    orderId,
    userId,
    formData,
  ) {
    const response = await httpClient.post(
      `/service-order-files/order/${orderId}/user/${userId}`,
      formData,
    );

    return response.data;
  },

  async remove(fileId, userId) {
    const response = await httpClient.delete(
      `/service-order-files/${fileId}/user/${userId}`,
    );

    return response.data;
  },
};