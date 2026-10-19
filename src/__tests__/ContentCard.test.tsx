import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ContentCard from "@/components/cards/ContentCard";
import { makeItem, renderWithStore } from "@/test-utils";

describe("ContentCard", () => {
  it("shows the headline, description, source and a Read More link", () => {
    renderWithStore(<ContentCard item={makeItem()} />);

    expect(screen.getByRole("heading", { name: "Test headline" })).toBeInTheDocument();
    expect(screen.getByText("A short description")).toBeInTheDocument();
    expect(screen.getByText("Test Source")).toBeInTheDocument();

    const link = screen.getByRole("link", { name: /read more/i });
    expect(link).toHaveAttribute("href", "https://example.com/article");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", expect.stringContaining("noopener"));
  });

  it("uses a movie-specific call to action", () => {
    renderWithStore(<ContentCard item={makeItem({ type: "movie", title: "Dune" })} />);
    expect(screen.getByRole("link", { name: /view movie/i })).toBeInTheDocument();
  });

  it("shows no link for mock social posts", () => {
    renderWithStore(<ContentCard item={makeItem({ type: "social", url: "#", source: "@sara" })} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("falls back to an icon when the image is missing or fails to load", () => {
    const { container, unmount } = renderWithStore(<ContentCard item={makeItem({ image: null })} />);
    expect(container.querySelector("img")).toBeNull();
    unmount();

    const view = renderWithStore(<ContentCard item={makeItem()} />);
    const img = view.container.querySelector("img")!;
    expect(img).toHaveAttribute("src", "https://example.com/a.jpg");
    fireEvent.error(img);
    expect(view.container.querySelector("img")).toBeNull();
  });

  it("does not show 'Invalid Date' for a bad date", () => {
    renderWithStore(<ContentCard item={makeItem({ publishedAt: "not-a-date" })} />);
    expect(screen.queryByText(/invalid date/i)).not.toBeInTheDocument();
  });

  it("adds and removes a favorite through the heart button", async () => {
    const user = userEvent.setup();
    const { store } = renderWithStore(<ContentCard item={makeItem()} />);

    await user.click(screen.getByRole("button", { name: "Add Test headline to favorites" }));
    expect(store.getState().favorites).toHaveLength(1);

    const remove = screen.getByRole("button", { name: "Remove Test headline from favorites" });
    expect(remove).toHaveAttribute("aria-pressed", "true");

    await user.click(remove);
    expect(store.getState().favorites).toHaveLength(0);
  });

  it("shows an already-saved item as favorited", () => {
    const item = makeItem();
    renderWithStore(<ContentCard item={item} />, { favorites: [item] });
    expect(screen.getByRole("button", { name: /remove .* from favorites/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});