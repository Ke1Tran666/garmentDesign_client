import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import Pagination from "./Pagination";

describe("Pagination", () => {
  test("không hiển thị khi chỉ có một trang", () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  test("hiển thị khi chỉ có một trang nếu showOnSinglePage bật", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={1}
        onPageChange={vi.fn()}
        showOnSinglePage
      />,
    );

    const summary = screen.getByText(/Trang/, {
      selector: "p",
    });

    expect(summary).toHaveTextContent("Trang 1 / 1");
  });

  test("vô hiệu hóa nút Trước ở trang đầu", () => {
    render(
      <Pagination
        currentPage={1}
        totalPages={5}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Trước" }),
    ).toBeDisabled();

    expect(
      screen.getByRole("button", { name: "Sau" }),
    ).toBeEnabled();
  });

  test("vô hiệu hóa nút Sau ở trang cuối", () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={5}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Trước" }),
    ).toBeEnabled();

    expect(
      screen.getByRole("button", { name: "Sau" }),
    ).toBeDisabled();
  });

  test("chuyển đến trang tiếp theo khi nhấn Sau", async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();

    render(
      <Pagination
        currentPage={2}
        totalPages={5}
        onPageChange={handlePageChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Sau" }),
    );

    expect(handlePageChange).toHaveBeenCalledWith(3);
    expect(handlePageChange).toHaveBeenCalledTimes(1);
  });

  test("chuyển về trang trước khi nhấn Trước", async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();

    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={handlePageChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Trước" }),
    );

    expect(handlePageChange).toHaveBeenCalledWith(2);
  });

  test("chuyển đến trang được chọn", async () => {
    const user = userEvent.setup();
    const handlePageChange = vi.fn();

    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={handlePageChange}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "4" }),
    );

    expect(handlePageChange).toHaveBeenCalledWith(4);
  });

  test("đánh dấu trang hiện tại bằng aria-current", () => {
    render(
      <Pagination
        currentPage={3}
        totalPages={5}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "3",
        current: "page",
      }),
    ).toBeInTheDocument();
  });

  test("rút gọn danh sách trang và hiển thị dấu ba chấm", () => {
    render(
      <Pagination
        currentPage={5}
        totalPages={10}
        onPageChange={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "1" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "4" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "5" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "6" }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "10" }),
    ).toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "2" }),
    ).not.toBeInTheDocument();

    expect(screen.getAllByText("...")).toHaveLength(2);
  });

  test("hiển thị thông tin số bản ghi", () => {
    render(
      <Pagination
        currentPage={2}
        totalPages={4}
        onPageChange={vi.fn()}
        showingStart={11}
        showingEnd={20}
        totalItems={35}
      />,
    );

    const summary = screen.getByText(/Hiển thị/, {
      selector: "p",
    });

    expect(summary).toHaveTextContent(
      "Hiển thị 11-20 trong số 35 bản ghi",
    );
  });
});