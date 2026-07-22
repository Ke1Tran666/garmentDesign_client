import axios from "axios";

import { BASE_URL_API } from "./config";

const httpClient = axios.create({
  baseURL: BASE_URL_API,
  timeout: 30000,
});

export default httpClient;