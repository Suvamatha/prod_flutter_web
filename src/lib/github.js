const REPO_RE = /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/([A-Za-z0-9._-]{1,100}?)(?:\.git)?\/?(?:[?#].*)?$/i

/** Parses a GitHub repository URL. Returns null when the input isn't a repository URL. */
export function parseRepoUrl(input = '') {
  const m = input.trim().match(REPO_RE)
  if (!m) return null
  const [, owner, repo] = m
  return {
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}`,
    display: `github.com/${owner}/${repo}`,
  }
}
