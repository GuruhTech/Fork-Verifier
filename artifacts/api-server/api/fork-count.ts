import type { VercelRequest, VercelResponse } from "@vercel/node";

const REPO_OWNER = "GuruhTech";
const REPO_NAME = "ULTRA-GURU";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ultra-guru-fork-verifier",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const resp = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
      { headers }
    );
    if (!resp.ok) return res.status(500).json({ error: "Failed to fetch repo data." });
    const data = (await resp.json()) as { forks_count: number };
    return res.status(200).json({ count: data.forks_count });
  } catch {
    return res.status(500).json({ error: "Failed to contact GitHub API." });
  }
}
