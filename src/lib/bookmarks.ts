export interface Bookmark {
  id: string;
  title: string;
  description: string;
  chartType: string;
  data: Record<string, any>;
  config: Record<string, any>;
  timestamp: Date;
}

const STORAGE_KEY = "vecta-bookmarks";

export function loadBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];
  
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  
  try {
    const parsed = JSON.parse(saved);
    return parsed.map((b: any) => ({
      ...b,
      timestamp: new Date(b.timestamp),
    }));
  } catch (e) {
    console.error("Failed to parse bookmarks:", e);
    return [];
  }
}

export function saveBookmarks(bookmarks: Bookmark[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export function addBookmark(bookmark: Omit<Bookmark, "id" | "timestamp">): Bookmark {
  const bookmarks = loadBookmarks();
  const newBookmark: Bookmark = {
    ...bookmark,
    id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };
  bookmarks.push(newBookmark);
  saveBookmarks(bookmarks);
  return newBookmark;
}

export function removeBookmark(id: string): void {
  const bookmarks = loadBookmarks();
  const filtered = bookmarks.filter((b) => b.id !== id);
  saveBookmarks(filtered);
}

export function isBookmarked(title: string, chartType: string): boolean {
  const bookmarks = loadBookmarks();
  return bookmarks.some((b) => b.title === title && b.chartType === chartType);
}

export function getBookmarkByTitle(title: string): Bookmark | undefined {
  const bookmarks = loadBookmarks();
  return bookmarks.find((b) => b.title === title);
}

