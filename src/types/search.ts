export interface CourseSearchResult {
    id: string;
    title: string;
    slug: string;
    imagePreview?: string | null;
    authorUsername: string;
}

export interface AuthorSearchResult {
    userId: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
    avatarColor?: string | null;
}

export interface SearchResultItem {
    type: 'course' | 'author';
    data: CourseSearchResult | AuthorSearchResult;
}

export interface GlobalSearchResponseDTO {
    results: SearchResultItem[];
}
