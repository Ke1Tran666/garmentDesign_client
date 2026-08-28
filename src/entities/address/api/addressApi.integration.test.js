import {
  describe,
  expect,
  test,
} from "vitest";
import { addressApi } from "./addressApi";

const TEST_USER_ID =
  import.meta.env.VITE_TEST_USER_ID;

const ALLOW_REAL_API_WRITE =
  import.meta.env.VITE_ALLOW_REAL_API_WRITE ===
  "true";

const describeRealApi = TEST_USER_ID
  ? describe
  : describe.skip;

const describeRealWriteApi =
  TEST_USER_ID && ALLOW_REAL_API_WRITE
    ? describe
    : describe.skip;

describeRealApi("addressApi - API thật chỉ đọc", () => {
  test(
    "lấy danh sách địa chỉ từ backend thật",
    async () => {
      const result =
        await addressApi.getByUser(TEST_USER_ID);

      expect(Array.isArray(result)).toBe(true);

      for (const item of result) {
        expect(item).toEqual(
          expect.objectContaining({
            addressId: expect.any(Number),
          }),
        );
      }
    },
    10000,
  );
});

describeRealWriteApi(
  "addressApi - API thật có thay đổi dữ liệu",
  () => {
    test(
      "tạo, đọc, cập nhật và xóa địa chỉ",
      async () => {
        let createdAddressId = null;

        const originalPayload = {
          companyName: "__FE_API_TEST__",
          address: "__FE_API_TEST_ADDRESS__",
          note: "Created by FE integration test",
        };

        const updatedPayload = {
          ...originalPayload,
          note: "Updated by FE integration test",
        };

        try {
          // CREATE
          const createdAddress =
            await addressApi.create(
              TEST_USER_ID,
              originalPayload,
            );

          expect(createdAddress).toEqual(
            expect.objectContaining({
              addressId: expect.any(Number),
              companyName:
                originalPayload.companyName,
              address: originalPayload.address,
              note: originalPayload.note,
            }),
          );

          createdAddressId =
            createdAddress.addressId;

          // READ
          const addressesAfterCreate =
            await addressApi.getByUser(
              TEST_USER_ID,
            );

          expect(
            addressesAfterCreate.some(
              (item) =>
                item.addressId ===
                createdAddressId,
            ),
          ).toBe(true);

          // UPDATE
          const updatedAddress =
            await addressApi.update(
              createdAddressId,
              updatedPayload,
            );

          expect(updatedAddress).toEqual(
            expect.objectContaining({
              addressId: createdAddressId,
              companyName:
                updatedPayload.companyName,
              address: updatedPayload.address,
              note: updatedPayload.note,
            }),
          );

          // READ AFTER UPDATE
          const addressesAfterUpdate =
            await addressApi.getByUser(
              TEST_USER_ID,
            );

          const savedAddress =
            addressesAfterUpdate.find(
              (item) =>
                item.addressId ===
                createdAddressId,
            );

          expect(savedAddress).toEqual(
            expect.objectContaining({
              note: updatedPayload.note,
            }),
          );

          // DELETE
          const deletedAddressId =
            createdAddressId;

          await addressApi.remove(
            deletedAddressId,
          );

          createdAddressId = null;

          // READ AFTER DELETE
          const addressesAfterDelete =
            await addressApi.getByUser(
              TEST_USER_ID,
            );

          expect(
            addressesAfterDelete.some(
              (item) =>
                item.addressId ===
                deletedAddressId,
            ),
          ).toBe(false);
        } finally {
          // Dọn dữ liệu nếu test lỗi giữa chừng
          if (createdAddressId !== null) {
            await addressApi.remove(
              createdAddressId,
            );
          }
        }
      },
      30000,
    );
  },
);