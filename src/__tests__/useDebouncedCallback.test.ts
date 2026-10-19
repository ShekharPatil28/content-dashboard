import { act, renderHook } from "@testing-library/react";
import { useDebouncedCallback } from "@/hooks/useDebouncedCallback";

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe("useDebouncedCallback", () => {
  it("runs once, with the latest arguments, after the delay", () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 400));

    act(() => {
      result.current("b");
      result.current("ba");
      result.current("bat");
    });
    expect(fn).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(399);
    });
    expect(fn).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("bat");
  });

  it("restarts the wait on every new call", () => {
    const fn = jest.fn();
    const { result } = renderHook(() => useDebouncedCallback(fn, 400));

    act(() => result.current("a"));
    act(() => jest.advanceTimersByTime(300));
    act(() => result.current("ab"));
    act(() => jest.advanceTimersByTime(300));
    expect(fn).not.toHaveBeenCalled();

    act(() => jest.advanceTimersByTime(100));
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith("ab");
  });

  it("does not fire after the component unmounts", () => {
    const fn = jest.fn();
    const { result, unmount } = renderHook(() => useDebouncedCallback(fn, 400));

    act(() => result.current("x"));
    unmount();
    act(() => jest.advanceTimersByTime(1000));
    expect(fn).not.toHaveBeenCalled();
  });
});