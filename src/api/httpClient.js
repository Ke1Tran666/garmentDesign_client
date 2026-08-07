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

export default httpClient;