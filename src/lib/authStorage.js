const TOKEN_KEY = "token";
const USER_ID_KEY = "idUser";

export const authStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUserId() {
    return localStorage.getItem(USER_ID_KEY);
  },

  save({ token, idUser }) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }

    if (idUser !== undefined && idUser !== null) {
      localStorage.setItem(USER_ID_KEY, String(idUser));
    }
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem("user");
    localStorage.removeItem("authProviders");
  },
};