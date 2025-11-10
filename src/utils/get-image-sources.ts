export const getImageSources = (src: string) => {
  // /images/sig-banners/agile-research-studios_banner-image.png
  const lastSlash = src.lastIndexOf('/')
  const dir = src.slice(0, lastSlash) // /images/sig-banners
  const fileWithExt = src.slice(lastSlash + 1) // agile-research-studios_banner-image.png

  const dot = fileWithExt.lastIndexOf('.')
  const basename
    = dot === -1 ? fileWithExt : fileWithExt.slice(0, dot) // agile-research-studios_banner-image

  return {
    avif: `${dir}/avif/${basename}.avif`,
    webp: `${dir}/webp/${basename}.webp`,
    fallback: src,
  }
}
