import { Router, type IRouter } from "express";
import { VerifyForkBody } from "@workspace/api-zod";

const router: IRouter = Router();

const REPO_OWNER = "GuruhTech";
const REPO_NAME = "ULTRA-GURU";
const HEROKU_DEPLOY_URL = `https://dashboard.heroku.com/new?template=https://github.com/${REPO_OWNER}/${REPO_NAME}`;

function getGitHubHeaders(): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ultra-guru-fork-verifier",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// GET /api/fork-count
router.get("/fork-count", async (req, res): Promise<void> => {
  try {
    const resp = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`,
      { headers: getGitHubHeaders() }
    );
    if (!resp.ok) {
      res.status(500).json({ error: "Failed to fetch repo data from GitHub." });
      return;
    }
    const data = await resp.json() as { forks_count: number };
    res.json({ count: data.forks_count });
  } catch (err) {
    req.log.error({ err }, "fork-count fetch failed");
    res.status(500).json({ error: "Failed to contact GitHub API." });
  }
});

// POST /api/verify-fork
router.post("/verify-fork", async (req, res): Promise<void> => {
  const parsed = VerifyForkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username } = parsed.data;
  const headers = getGitHubHeaders();

  try {
    let found = false;
    let forkUrl: string | null = null;

    const directCheck = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(username)}/${REPO_NAME}`,
      { headers }
    );

    if (directCheck.ok) {
      const forkData = await directCheck.json() as {
        fork: boolean;
        parent?: { full_name: string };
        html_url: string;
      };
      if (forkData.fork && forkData.parent?.full_name === `${REPO_OWNER}/${REPO_NAME}`) {
        found = true;
        forkUrl = forkData.html_url;
      }
    } else if (directCheck.status === 404) {
      for (let page = 1; page <= 5 && !found; page++) {
        const forksRes = await fetch(
          `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/forks?per_page=100&page=${page}&sort=newest`,
          { headers }
        );
        if (!forksRes.ok) {
          if (forksRes.status === 403 || forksRes.status === 429) {
            res.status(500).json({ error: "GitHub API rate limit reached. Try again later." });
            return;
          }
          break;
        }
        const forks = await forksRes.json() as Array<{ owner: { login: string }; html_url: string }>;
        if (!Array.isArray(forks) || forks.length === 0) break;
        const match = forks.find((f) => f.owner.login.toLowerCase() === username.toLowerCase());
        if (match) { found = true; forkUrl = match.html_url; }
      }
    } else if (directCheck.status === 403 || directCheck.status === 429) {
      res.status(500).json({ error: "GitHub API rate limit reached. Try again later." });
      return;
    }

    res.json({
      hasFork: found,
      username,
      forkUrl: forkUrl ?? null,
      redirectUrl: found ? HEROKU_DEPLOY_URL : null,
    });
  } catch (err) {
    req.log.error({ err }, "GitHub API request failed");
    res.status(500).json({ error: "Failed to contact GitHub API. Please try again." });
  }
});

export default router;
