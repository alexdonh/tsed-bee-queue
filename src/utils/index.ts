export function removeTrailingSlash(url: string) {
  if (url === "/") return url;
  return url.replace(/\/+/g, "/").replace(/\/+$/, "");
}
