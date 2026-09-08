export interface SearchResult {
  title: string;
  author: string;
  year: string;
  pages: number;
  isbn: string;
  coverUrl: string;
  tags: string[];
}

interface OpenLibraryDoc {
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  number_of_pages_median?: number;
  isbn?: string[];
  cover_i?: number;
  subject?: string[];
}

interface OpenLibraryResponse {
  docs?: OpenLibraryDoc[];
}

interface GoogleIndustryIdentifier {
  type?: string;
  identifier?: string;
}

interface GoogleVolumeInfo {
  title?: string;
  authors?: string[];
  publishedDate?: string;
  pageCount?: number;
  industryIdentifiers?: GoogleIndustryIdentifier[];
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  categories?: string[];
}

interface GoogleBookItem {
  volumeInfo?: GoogleVolumeInfo;
}

interface GoogleBooksResponse {
  items?: GoogleBookItem[];
}

const OPEN_LIBRARY_FIELDS = [
  "key",
  "title",
  "author_name",
  "first_publish_year",
  "number_of_pages_median",
  "isbn",
  "cover_i",
  "subject",
].join(",");

const UNAVAILABLE_ERROR = "book_search_unavailable";

function cleanList(values: string[] | undefined, limit: number) {
  return Array.from(
    new Set((values ?? []).map(value => value.trim()).filter(Boolean)),
  ).slice(0, limit);
}

function normalizeIsbn(values: string[] | undefined) {
  return (
    values?.find(value => value.replaceAll("-", "").length === 13) ??
    values?.find(value => value.replaceAll("-", "").length === 10) ??
    values?.[0] ??
    ""
  );
}

function normalizeOpenLibrary(data: OpenLibraryResponse): SearchResult[] {
  return (data.docs ?? [])
    .filter(doc => doc.title?.trim())
    .map(doc => ({
      title: doc.title?.trim() ?? "Unknown title",
      author: doc.author_name?.[0]?.trim() || "Unknown author",
      year: doc.first_publish_year ? String(doc.first_publish_year) : "",
      pages: doc.number_of_pages_median ?? 0,
      isbn: normalizeIsbn(doc.isbn),
      coverUrl: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg` : "",
      tags: cleanList(doc.subject, 2),
    }))
    .slice(0, 6);
}

function normalizeGoogleBooks(data: GoogleBooksResponse): SearchResult[] {
  return (data.items ?? [])
    .map(item => item.volumeInfo ?? {})
    .filter(volume => volume.title?.trim())
    .map(volume => {
      const isbn =
        volume.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier ??
        volume.industryIdentifiers?.find(id => id.type === "ISBN_10")?.identifier ??
        "";
      const thumb = volume.imageLinks?.thumbnail ?? volume.imageLinks?.smallThumbnail ?? "";

      return {
        title: volume.title?.trim() ?? "Unknown title",
        author: volume.authors?.[0]?.trim() || "Unknown author",
        year: (volume.publishedDate ?? "").slice(0, 4),
        pages: volume.pageCount ?? 0,
        isbn,
        coverUrl: thumb.replace("http://", "https://"),
        tags: cleanList(volume.categories, 2),
      };
    })
    .slice(0, 6);
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(String(response.status));
  return response.json() as Promise<T>;
}

async function searchOpenLibrary(query: string): Promise<SearchResult[]> {
  const url =
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}` +
    `&limit=8&fields=${encodeURIComponent(OPEN_LIBRARY_FIELDS)}`;
  return normalizeOpenLibrary(await fetchJson<OpenLibraryResponse>(url));
}

async function searchGoogleBooks(query: string): Promise<SearchResult[]> {
  const url =
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}` +
    "&maxResults=6&printType=books&projection=lite";
  return normalizeGoogleBooks(await fetchJson<GoogleBooksResponse>(url));
}

export async function searchBooks(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  let openLibraryFailed = false;

  try {
    const openLibraryResults = await searchOpenLibrary(trimmed);
    if (openLibraryResults.length) return openLibraryResults;
  } catch {
    openLibraryFailed = true;
  }

  try {
    const googleResults = await searchGoogleBooks(trimmed);
    if (googleResults.length || openLibraryFailed) return googleResults;
  } catch {
    if (openLibraryFailed) throw new Error(UNAVAILABLE_ERROR);
  }

  return [];
}

export function isBookSearchUnavailable(error: unknown) {
  return error instanceof Error && error.message === UNAVAILABLE_ERROR;
}
