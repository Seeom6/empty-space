

export function parsImageUrl(path: string): string{
  return `${process.env.BASE_URL}/${path}`
}