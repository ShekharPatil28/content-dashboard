import "@testing-library/jest-dom";

// jsdom doesn't ship these browser APIs, so give components harmless stand-ins
if (typeof window !== "undefined") {
  class NoopObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  window.IntersectionObserver = NoopObserver as unknown as typeof IntersectionObserver;
  window.ResizeObserver = NoopObserver as unknown as typeof ResizeObserver;

  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }

  // any test that forgets to mock the network fails loudly instead of hanging
  globalThis.fetch = (() =>
    Promise.reject(new Error("fetch is not mocked in this test"))) as typeof fetch;
}