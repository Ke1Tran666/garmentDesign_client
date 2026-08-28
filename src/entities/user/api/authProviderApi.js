import httpClient from "@/shared/api/httpClient";

export const authProviderApi = {
  async remove(providerId) {
    const response = await httpClient.delete(
      `/user-auth-providers/${providerId}`,
    );

    return response.data;
  },
};
