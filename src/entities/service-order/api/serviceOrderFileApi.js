import httpClient from "@/shared/api/httpClient";

export const serviceOrderFileApi = {
  async getMine(config = {}) {
    const response = await httpClient.get(
      "/service-order-files/me",
      config,
    );

    return response.data;
  },

  async getByOrder(orderId, config = {}) {
    const response = await httpClient.get(
      `/service-order-files/me/orders/${orderId}`,
      config,
    );

    return response.data;
  },

  async upload(orderId, formData) {
    const response = await httpClient.post(
      `/service-order-files/me/orders/${orderId}`,
      formData,
    );

    return response.data;
  },

  async remove(fileId) {
    const response = await httpClient.delete(
      `/service-order-files/me/${fileId}`,
    );

    return response.data;
  },
};
