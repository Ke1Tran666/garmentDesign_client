import { useCallback, useEffect, useMemo, useState } from "react";

import { authApi } from "@/features/auth/api/authApi";
import AuthContext from "./AuthContext";

const AuthProvider = ({ children }) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const refreshSession =
    useCallback(async () => {
      try {
        const currentUser =
          await authApi.me();

        setUser(currentUser);

        return currentUser;
      } catch (error) {
        if (
          error.response?.status === 401
        ) {
          setUser(null);
          return null;
        }

        throw error;
      }
    }, []);

  const logout =
    useCallback(async () => {
      try {
        await authApi.logout();
      } finally {
        setUser(null);

        await authApi
          .csrf()
          .catch(() => {});
      }
    }, []);

  useEffect(() => {
    let active = true;

    const initialize = async () => {
      try {
        await authApi.csrf();

        const currentUser =
          await authApi.me();

        if (active) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error(
          "Không thể khởi tạo phiên:",
          error,
        );

        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      setUser,
      refreshSession,
      logout,
      isAuthenticated:
        Boolean(user),
    }),
    [
      user,
      loading,
      refreshSession,
      logout,
    ],
  );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
