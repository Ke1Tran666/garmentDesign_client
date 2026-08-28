import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import PrimaryButton from "./PrimaryButton";

describe("PrimaryButton", () => {
  test("hiển thị nội dung của nút", () => {
    render(<PrimaryButton>Đăng nhập</PrimaryButton>);

    expect(
      screen.getByRole("button", { name: "Đăng nhập" }),
    ).toBeInTheDocument();
  });

  test("gọi onClick khi người dùng nhấn nút", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <PrimaryButton onClick={handleClick}>
        Đăng nhập
      </PrimaryButton>,
    );

    await user.click(
      screen.getByRole("button", { name: "Đăng nhập" }),
    );

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("không cho phép nhấn khi nút bị disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <PrimaryButton disabled onClick={handleClick}>
        Đang xử lý
      </PrimaryButton>,
    );

    const button = screen.getByRole("button", {
      name: "Đang xử lý",
    });

    expect(button).toBeDisabled();

    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  test("sử dụng type được truyền vào", () => {
    render(
      <PrimaryButton type="submit">
        Gửi dữ liệu
      </PrimaryButton>,
    );

    expect(
      screen.getByRole("button", { name: "Gửi dữ liệu" }),
    ).toHaveAttribute("type", "submit");
  });
});