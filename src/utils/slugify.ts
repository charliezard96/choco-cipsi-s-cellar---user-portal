export function slugify(name: string, producer: string): string {
  const normalize = (s: string) =>
    s.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  return `${normalize(name)}-${normalize(producer)}`;
}
