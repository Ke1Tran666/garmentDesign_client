import { render, screen } from "@testing-library/react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test } from "vitest";
import App from "./App";

const renderApp = (path) => {
  return render(
    <GoogleOAuthProvider clientId="test-client-id">
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </GoogleOAuthProvider>
  );
};

describe("App main routes", () => {
  test("renders login route", () => {
    renderApp("/login");

    expect(
      screen.getByRole("button", { name: /google/i })
    ).toBeInTheDocument();
  });

  test("redirects user route to profile shell", () => {
    renderApp("/user");

    expect(
      screen.getByRole("heading", { name: /My Profile/i })
    ).toBeInTheDocument();
  });
});