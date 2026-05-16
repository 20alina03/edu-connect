import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";

const useAuthMock = vi.fn();

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

describe("ProtectedRoute", () => {
  beforeEach(() => {
    useAuthMock.mockReset();
  });

  it("waits for role resolution before rendering a protected teacher route", () => {
    useAuthMock.mockReturnValue({
      user: { id: "teacher-1" },
      role: null,
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard/teacher"]}>
        <Routes>
          <Route
            path="/dashboard/teacher"
            element={
              <ProtectedRoute requireRole="teacher">
                <div>Teacher dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
    expect(screen.queryByText("Teacher dashboard")).not.toBeInTheDocument();
  });

  it("renders the teacher dashboard when the role is resolved", () => {
    useAuthMock.mockReturnValue({
      user: { id: "teacher-1" },
      role: "teacher",
      loading: false,
    });

    render(
      <MemoryRouter initialEntries={["/dashboard/teacher"]}>
        <Routes>
          <Route
            path="/dashboard/teacher"
            element={
              <ProtectedRoute requireRole="teacher">
                <div>Teacher dashboard</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Teacher dashboard")).toBeInTheDocument();
  });
});