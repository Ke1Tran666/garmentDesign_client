export const OTP_LENGTH = 6;

export const createEmptyOtp = (length = OTP_LENGTH) =>
  Array(length).fill("");

export const toOtpCode = (otp) => otp.join("");

export const isOtpComplete = (otp, length = OTP_LENGTH) =>
  otp.length === length && otp.every((digit) => /^\d$/.test(digit));