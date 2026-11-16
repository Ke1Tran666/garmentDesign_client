import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import BirthdayInput from "./BirthdayInput";

describe("BirthdayInput Component", () => {
  test("hiển thị input rỗng khi không có value ban đầu", () => {
    render(<BirthdayInput />);
    const input = screen.getByRole("textbox", { name: /Ngày sinh/i });
    expect(input).toHaveValue("");
    expect(input).toHaveAttribute("placeholder", "DD/MM/YYYY");
  });

  test("hiển thị đúng định dạng DD/MM/YYYY khi truyền value dạng ISO YYYY-MM-DD", () => {
    render(<BirthdayInput value="2000-08-15" />);
    const input = screen.getByRole("textbox", { name: /Ngày sinh/i });
    expect(input).toHaveValue("15/08/2000");
  });

  test("tự động đồng bộ displayValue khi prop value thay đổi từ bên ngoài", () => {
    const { rerender } = render(<BirthdayInput value="1995-10-20" />);
    const input = screen.getByRole("textbox", { name: /Ngày sinh/i });
    expect(input).toHaveValue("20/10/1995");

    rerender(<BirthdayInput value="2001-01-05" />);
    expect(input).toHaveValue("05/01/2001");

    rerender(<BirthdayInput value="" />);
    expect(input).toHaveValue("");
  });

  test("áp dụng mask DD/MM/YYYY khi người dùng gõ số", () => {
    const handleChange = vi.fn();
    render(<BirthdayInput onChange={handleChange} />);
    const input = screen.getByRole("textbox", { name: /Ngày sinh/i });

    // Gõ 15
    fireEvent.change(input, { target: { value: "15" } });
    expect(input).toHaveValue("15");

    // Gõ tiếp 0
    fireEvent.change(input, { target: { value: "150" } });
    expect(input).toHaveValue("15/0");

    // Gõ đủ ngày tháng năm hợp lệ
    fireEvent.change(input, { target: { value: "15082000" } });
    expect(input).toHaveValue("15/08/2000");
    expect(handleChange).toHaveBeenCalledWith("2000-08-15");
  });

  test("gọi onChange('') khi ngày không hợp lệ hoặc chưa đầy đủ", () => {
    const handleChange = vi.fn();
    render(<BirthdayInput onChange={handleChange} />);
    const input = screen.getByRole("textbox", { name: /Ngày sinh/i });

    fireEvent.change(input, { target: { value: "15/08" } });
    expect(handleChange).toHaveBeenLastCalledWith("");

    // Ngày 31 tháng 2 không hợp lệ
    fireEvent.change(input, { target: { value: "31022020" } });
    expect(input).toHaveValue("31/02/2020");
    expect(handleChange).toHaveBeenLastCalledWith("");
  });

  test("mở popup lịch và cho phép chọn ngày", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<BirthdayInput value="2000-08-15" onChange={handleChange} />);

    const calendarBtn = screen.getByRole("button", {
      name: /Mở lịch chọn ngày sinh/i,
    });
    await user.click(calendarBtn);

    expect(
      screen.getByRole("dialog", { name: /Chọn ngày sinh/i }),
    ).toBeInTheDocument();

    // Click vào ngày 20 trong tháng 8/2000
    const day20Btn = screen.getByRole("button", { name: "20" });
    await user.click(day20Btn);

    expect(handleChange).toHaveBeenCalledWith("2000-08-20");
    expect(screen.getByRole("textbox", { name: /Ngày sinh/i })).toHaveValue(
      "20/08/2000",
    );
  });

  test("nút Xóa ngày đặt lại input rỗng và gọi onChange('')", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<BirthdayInput value="2000-08-15" onChange={handleChange} />);

    const calendarBtn = screen.getByRole("button", {
      name: /Mở lịch chọn ngày sinh/i,
    });
    await user.click(calendarBtn);

    const clearBtn = screen.getByRole("button", { name: /Xóa ngày/i });
    await user.click(clearBtn);

    expect(handleChange).toHaveBeenCalledWith("");
    expect(screen.getByRole("textbox", { name: /Ngày sinh/i })).toHaveValue("");
  });

  test("hỗ trợ variant auth với styling tương ứng", () => {
    render(<BirthdayInput variant="auth" label="Ngày sinh" />);
    expect(screen.getByText("Ngày sinh")).toBeInTheDocument();
  });

  test("không bị đóng popup lịch khi tương tác với dropdown chọn tháng/năm", async () => {
    const user = userEvent.setup();
    render(<BirthdayInput value="2000-08-15" />);

    const calendarBtn = screen.getByRole("button", {
      name: /Mở lịch chọn ngày sinh/i,
    });
    await user.click(calendarBtn);

    const dialog = screen.getByRole("dialog", { name: /Chọn ngày sinh/i });
    expect(dialog).toBeInTheDocument();

    // Click vào dropdown chọn tháng
    const monthSelect = screen.getByRole("combobox", { name: /Chọn tháng/i });
    await user.click(monthSelect);

    // Popup lịch vẫn phải mở, không bị out ra ngoài
    expect(dialog).toBeInTheDocument();
  });
});
