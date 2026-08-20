import axios from "axios";

import { BASE_URL_API } from "./config";

const httpClient = axios.create({
  baseURL: BASE_URL_API,
  timeout: 30000,

  // Gửi JSESSIONID tới backend.
  withCredentials: true,

  // Gửi XSRF-TOKEN qua header X-XSRF-TOKEN.
  withXSRFToken: true,

  xsrfCookieName: "XSRF-TOKEN",
  xsrfHeaderName: "X-XSRF-TOKEN",
});

let redirectingToLogin = false;

httpClient.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;

    /*
     * Session bị hết hạn hoặc bị cưỡng chế đăng xuất
     * từ một thiết bị khác.
     */
    if (
      status === 401 &&
      window.location.pathname !== "/login" &&
      !redirectingToLogin
    ) {
      redirectingToLogin = true;

      window.location.replace("/login");
    }

    return Promise.reject(error);
  },
);

export default httpClient;