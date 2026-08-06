const TOKEN_KEY = "token";
const USER_ID_KEY = "idUser";
const ROLE_KEY = "role";

export const authStorage = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUserId() {
    return localStorage.getItem(USER_ID_KEY);
  },

  getRole(){
    return localStorage.getItem(ROLE_KEY);
  },

  save({ token, idUser, role }) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }

    if (idUser !== undefined && idUser !== null) {
      localStorage.setItem(USER_ID_KEY, String(idUser));
    }

    if(role){
      localStorage.setItem(ROLE_KEY, String(role));
    }
  },

  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem("user");
    localStorage.removeItem("authProviders");
  },
};