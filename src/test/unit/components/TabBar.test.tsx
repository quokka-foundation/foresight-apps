/**
 * @jest-environment jsdom
 */

import { render, screen } from "@testing-library/react";
import React from "react";
import "@testing-library/jest-dom";

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: React.PropsWithChildren<{ href: string } & Record<string, unknown>>) {
    return React.createElement("a", { href, ...props }, children);
  };
});

// Mock next/navigation
jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

import { TabBar } from "@/components/TabBar";

describe("TabBar", () => {
  beforeEach(() => {
    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/");
  });

  it("renders all 5 tabs with aria-labels", () => {
    render(<TabBar />);
    expect(screen.getByLabelText("Feed")).toBeInTheDocument();
    expect(screen.getByLabelText("Wallets")).toBeInTheDocument();
    expect(screen.getByLabelText("Tokens")).toBeInTheDocument();
    expect(screen.getByLabelText("Alerts")).toBeInTheDocument();
    expect(screen.getByLabelText("Profile")).toBeInTheDocument();
  });

  it("renders correct links", () => {
    render(<TabBar />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(links[0]).toHaveAttribute("href", "/");
    expect(links[1]).toHaveAttribute("href", "/wallets");
    expect(links[2]).toHaveAttribute("href", "/tokens");
    expect(links[3]).toHaveAttribute("href", "/alerts");
    expect(links[4]).toHaveAttribute("href", "/profile");
  });

  it("highlights Feed tab on home page", () => {
    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/");
    render(<TabBar />);
    const feedLink = screen.getByLabelText("Feed");
    expect(feedLink.className).toContain("text-ios-blue");
  });

  it("highlights Wallets tab on wallets page", () => {
    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/wallets");
    render(<TabBar />);
    const walletsLink = screen.getByLabelText("Wallets");
    expect(walletsLink.className).toContain("text-ios-blue");
  });

  it("highlights Wallets tab on wallet detail page", () => {
    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/wallet/0x1234");
    render(<TabBar />);
    const walletsLink = screen.getByLabelText("Wallets");
    expect(walletsLink.className).toContain("text-ios-blue");
  });

  it("highlights Alerts tab on alerts page", () => {
    const { usePathname } = require("next/navigation");
    usePathname.mockReturnValue("/alerts");
    render(<TabBar />);
    const alertsLink = screen.getByLabelText("Alerts");
    expect(alertsLink.className).toContain("text-ios-blue");
  });
});
