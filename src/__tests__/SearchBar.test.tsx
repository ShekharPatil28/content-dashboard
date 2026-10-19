import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBar from "@/components/layout/SearchBar";

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockPathname = "/";
let mockSearch = "";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(mockSearch),
}));

const box = () => screen.getByRole("searchbox", { name: "Search content" });
const wait = (ms: number) =>
  act(() => {
    jest.advanceTimersByTime(ms);
  });

beforeEach(() => {
  jest.useFakeTimers();
  mockPush.mockClear();
  mockReplace.mockClear();
  mockPathname = "/";
  mockSearch = "";
});
afterEach(() => jest.useRealTimers());

describe("SearchBar", () => {
  it("waits for a pause in typing, then opens the search page", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar />);

    await user.type(box(), "batman");
    expect(mockPush).not.toHaveBeenCalled();

    wait(400);
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/search?q=batman");
  });

  it("encodes special characters in the url", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar />);
    await user.type(box(), "a&b c");
    wait(400);
    expect(mockPush).toHaveBeenCalledWith("/search?q=a%26b%20c");
  });

  it("replaces the url instead of adding history entries when already on the search page", async () => {
    mockPathname = "/search";
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar />);

    await user.type(box(), "dune");
    wait(400);
    expect(mockReplace).toHaveBeenCalledWith("/search?q=dune");
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("searches immediately when Enter is pressed", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar />);
    await user.type(box(), "dune{enter}");
    expect(mockPush).toHaveBeenCalledWith("/search?q=dune");
  });

  it("does nothing for blank input on other pages", async () => {
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar />);
    await user.type(box(), "   ");
    wait(400);
    expect(mockPush).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("starts with the query from the url and goes back to a bare /search when cleared", async () => {
    mockPathname = "/search";
    mockSearch = "q=dune";
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    render(<SearchBar />);
    expect(box()).toHaveValue("dune");

    await user.clear(box());
    wait(400);
    expect(mockReplace).toHaveBeenCalledWith("/search");
  });
});