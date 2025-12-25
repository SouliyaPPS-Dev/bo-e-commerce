export type ImageUrlValue = string | { url?: string | null } | null | undefined;

export const formatImageUrls = (
  value?: ImageUrlValue[]
): { url: string }[] =>
  (value ?? []).map((item) => {
    if (typeof item === 'string') {
      return { url: item };
    }
    if (item && typeof item === 'object') {
      const url = item.url;
      return { url: typeof url === 'string' ? url : '' };
    }
    return { url: '' };
  });

export const parseImageUrls = (value?: ImageUrlValue[]): string[] =>
  (value ?? [])
    .map((item) => {
      if (typeof item === 'string') {
        return item.trim();
      }
      if (item && typeof item === 'object') {
        const url = item.url;
        if (typeof url === 'string') {
          return url.trim();
        }
      }
      return '';
    })
    .filter((url) => Boolean(url));
