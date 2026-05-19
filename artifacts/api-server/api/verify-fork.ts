import type { VercelRequest, VercelResponse } from "@vercel/node";

const REPO_OWNER = "GuruhTech";
const REPO_NAME = "ULTRA-GURU";
const HEROKU_DEPLOY_URL = `https://dashboard.heroku.com/new?template=https://github.com/${REPO_OWNER}/${REPO_NAME}`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { username } = req.body ?? {};

  if (!username || typeof username !== "string" || !username.trim()) {
    return res.status(400).json({ error: "username is required" });
  }

  const cleanUsername = username.trim();
  const token = process.env.GITHUB_TOKEN;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ultra-guru-fork-verifier",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const directCheck = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(cleanUsername)}/${REPO_NAME}`,
      { headers }
    );

    if (directCheck.ok) {
      const forkData = (await directCheck.json()) as {
        fork: boolean;
        parent?: { full_name: string };
        html_url: string;
      };
      if (forkData.fork && forkData.parent?.full_name === `${REPO_OWNER}/${REPO_NAME}`) {
        return res.status(200).json({
          hasFork: true,
          username: cleanUsername,
          forkUrl: forkData.html_url,
          redirectUrl: HEROKU_DEPLOY_URL,
        });
      }
    } else if (directCheck.status === 403 || directCheck.status === 429) {
      return res.status(500).json({ error: "GitHub API rate limit reached. Try again later." });
    }

    let found = false;
    let forkUrl: string | null = null;

    for (let page = 1; page <= 5 && !found; page++) {
      const forksRes = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/forks?per_page=100&page=${page}&sort=newest`,
        { headers }
      );
      if (!forksRes.ok) {
        if (forksRes.status === 403 || forksRes.status === 429) {
          return res.status(500).json({ error: "GitHub API rate limit reached. Try again later." });
        }
        break;
      }
      const forks = (await forksRes.json()) as Array<{ owner: { login: string }; html_url: string }>;
      if (!Array.isArray(forks) || forks.length === 0) break;
      const match = forks.find((f) => f.owner.login.toLowerCase() === cleanUsername.toLowerCase());
      if (match) { found = true; forkUrl = match.html_url; }
    }

    return res.status(200).json({
      hasFork: found,
      username: cleanUsername,
      forkUrl: forkUrl ?? null,
      redirectUrl: found ? HEROKU_DEPLOY_URL : null,
    });
  } catch {
    return res.status(500).json({ error: "Failed to contact GitHub API. Please try again." });
  }
}
