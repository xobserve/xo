function importAll(r) {
  return Promise.all(
    r
      .keys()
      .filter((filename) => filename.startsWith('.'))
      .filter((filename) => !filename.includes('/snippets/'))
      .map(async (filename) => ({
        slug: filename.substr(2).replace(/\/index\.mdx$/, ''),
        filename,
        module: await r(filename),
      }))
  ).then((posts) =>
    posts
      .filter((p) => p.module.meta.private !== true)
      .sort((a, b) => dateSortDesc(a.module.meta.date, b.module.meta.date))
  )
}

function dateSortDesc(a, b) {
  if (a > b) return -1
  if (a < b) return 1
  return 0
}

export function getAllPostPreviews() {
  return importAll(require.context('../pages/blog/?preview', true, /\.mdx$/))
}

export function getAllPosts() {
  return importAll(require.context('../pages/blog/?rss', true, /\.mdx$/))
}
