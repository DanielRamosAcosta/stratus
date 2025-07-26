export function isMac(userAgent: string): boolean {
  return /Macintosh|Mac OS/.test(userAgent);
}
