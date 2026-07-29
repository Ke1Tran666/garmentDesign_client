// @vitest-environment node

import {
  describe,
  expect,
  test,
} from "vitest";
import { authApi } from "./authApi";

const TEST_EMAIL =
  import.meta.env.VITE_TEST_LOGIN_EMAIL;

const TEST_PASSWORD =
  import.meta.env.VITE_TEST_LOGIN_PASSWORD;

const TEST_PHONE =
  import.meta.env.VITE_TEST_LOGIN_PHONE;

const TEST_PHONE_OTP =
  import.meta.env.VITE_TEST_LOGIN_PHONE_OTP;

const testSendPhoneOtp =
  TEST_PHONE && !TEST_PHONE_OTP
    ? test
    : test.skip;

const testVerifyPhoneOtp =
  TEST_PHONE && TEST_PHONE_OTP
    ? test
    : test.skip;

const TEST_GOOGLE_ACCESS_TOKEN =
  import.meta.env.VITE_TEST_GOOGLE_ACCESS_TOKEN;

const hasTestAccount =
  Boolean(TEST_EMAIL) &&
  Boolean(TEST_PASSWORD);

const describeRealLogin = hasTestAccount
  ? describe
  : describe.skip;

describeRealLogin(
  "authApi - đăng nhập bằng API thật",
  () => {
    test(
      "đăng nhập thành công bằng tài khoản test",
      async () => {
        const result = await authApi.login({
          email: TEST_EMAIL,
          password: TEST_PASSWORD,
        });

        expect(result).toEqual(
          expect.objectContaining({
            token: expect.any(String),
            idUser: expect.any(String),
          }),
        );

        expect(result.token.length).toBeGreaterThan(
          0,
        );

        expect(
          result.idUser.length,
        ).toBeGreaterThan(0);
      },
      30000,
    );

    test(
      "backend từ chối mật khẩu không đúng",
      async () => {
        let receivedError;

        try {
          await authApi.login({
            email: TEST_EMAIL,
            password:
              `${TEST_PASSWORD}__WRONG__`,
          });
        } catch (error) {
          receivedError = error;
        }

        expect(receivedError).toBeDefined();

        expect(
          receivedError.response?.status,
        ).toBeGreaterThanOrEqual(400);
      },
      30000,
    );
  },
);

// PHONE
describe("authApi - đăng nhập phone bằng API thật", () => {
  testSendPhoneOtp(
    "gửi OTP đến số điện thoại test",
    async () => {
      const result =
        await authApi.sendPhoneOtp(TEST_PHONE);

      expect(result).toBeDefined();
    },
    30000,
  );

  testVerifyPhoneOtp(
    "xác nhận OTP và đăng nhập thành công",
    async () => {
      const result =
        await authApi.verifyPhoneOtp({
          phone: TEST_PHONE,
          otp: TEST_PHONE_OTP,
        });

      expect(result).toEqual(
        expect.objectContaining({
          token: expect.any(String),
          idUser: expect.any(String),
        }),
      );

      expect(result.token.length).toBeGreaterThan(0);
      expect(result.idUser.length).toBeGreaterThan(0);
    },
    30000,
  );
});

// GOOGLE

const hasGoogleAccessToken =
  Boolean(TEST_GOOGLE_ACCESS_TOKEN);

const describeRealGoogleLogin =
  hasGoogleAccessToken
    ? describe
    : describe.skip;

describeRealGoogleLogin(
  "authApi - đăng nhập Google bằng API thật",
  () => {
    test(
      "đăng nhập thành công bằng Google access token",
      async () => {
        const result =
          await authApi.googleLogin(
            TEST_GOOGLE_ACCESS_TOKEN,
          );

        expect(result).toEqual(
          expect.objectContaining({
            token: expect.any(String),
            idUser: expect.any(String),
          }),
        );

        expect(
          result.token.length,
        ).toBeGreaterThan(0);

        expect(
          result.idUser.length,
        ).toBeGreaterThan(0);
      },
      30000,
    );

    test(
      "backend từ chối Google access token không hợp lệ",
      async () => {
        let receivedError;

        try {
          await authApi.googleLogin(
            "invalid-google-access-token",
          );
        } catch (error) {
          receivedError = error;
        }

        expect(receivedError).toBeDefined();

        expect(
          receivedError.response?.status,
        ).toBeGreaterThanOrEqual(400);
      },
      30000,
    );
  },
);