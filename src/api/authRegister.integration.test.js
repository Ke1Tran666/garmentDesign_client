// @vitest-environment node

import {
  describe,
  expect,
  test,
} from "vitest";
import { authApi } from "./authApi";
import { userApi } from "./userApi";

const ALLOW_REAL_API_WRITE =
  import.meta.env.VITE_ALLOW_REAL_API_WRITE ===
  "true";

const EMAIL_BASE =
  import.meta.env
    .VITE_TEST_REGISTER_EMAIL_BASE;

const TEST_PASSWORD =
  import.meta.env
    .VITE_TEST_REGISTER_PASSWORD;

const canRunRealRegistration =
  ALLOW_REAL_API_WRITE &&
  Boolean(EMAIL_BASE) &&
  Boolean(TEST_PASSWORD);

const describeRealRegistration =
  canRunRealRegistration
    ? describe
    : describe.skip;

const createUniqueEmail = (baseEmail) => {
  const separatorIndex =
    baseEmail.lastIndexOf("@");

  if (separatorIndex <= 0) {
    throw new Error(
      "VITE_TEST_REGISTER_EMAIL_BASE không hợp lệ",
    );
  }

  const localPart = baseEmail.slice(
    0,
    separatorIndex,
  );

  const domain = baseEmail.slice(
    separatorIndex + 1,
  );

  return `${localPart}+${Date.now()}@${domain}`;
};

describeRealRegistration(
  "authApi - đăng ký bằng API thật",
  () => {
    test(
      "đăng ký, đăng nhập, kiểm tra trùng email và dọn tài khoản",
      async () => {
        const uniqueEmail =
          createUniqueEmail(EMAIL_BASE);

        const registerPayload = {
          email: uniqueEmail,
          password: TEST_PASSWORD,
          fullName: "Frontend Integration Test",
          gender: "Male",
          birthday: "2000-08-15",
        };

        let createdUserId = null;

        try {
          // REGISTER
          const registerResult =
            await authApi.register(
              registerPayload,
            );

          expect(registerResult).toEqual(
            expect.objectContaining({
              message: "Đăng ký thành công",
            }),
          );

          // LOGIN TO GET USER ID
          const loginResult =
            await authApi.login({
              email: uniqueEmail,
              password: TEST_PASSWORD,
            });

          expect(loginResult).toEqual(
            expect.objectContaining({
              token: expect.any(String),
              idUser: expect.any(String),
            }),
          );

          createdUserId = loginResult.idUser;

          // REGISTER DUPLICATE EMAIL
          let duplicateError;

          try {
            await authApi.register(
              registerPayload,
            );
          } catch (error) {
            duplicateError = error;
          }

          expect(duplicateError).toBeDefined();

          expect(
            duplicateError.response?.status,
          ).toBeGreaterThanOrEqual(400);
        } finally {
          // Soft-delete tài khoản vừa tạo
          if (createdUserId !== null) {
            await userApi.deleteAccount(
              createdUserId,
            );
          }
        }
      },
      30000,
    );
  },
);