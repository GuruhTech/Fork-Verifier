import { Router, type IRouter } from "express";
import { VerifyForkBody } from "@workspace/api-zod";

const router: IRouter = Router();

const REPO_OWNER = "GuruhTech";
const REPO_NAME = "ULTRA-GURU";
const HEROKU_DEPLOY_URL = `https://dashboard.heroku.com/new?template=https://github.com/${REPO_OWNER}/${REPO_NAME}`;

router.post("/verify-fork", async (req, res): Promise<void> => {
  const parsed = VerifyForkBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username } = parsed.data;
  const token = process.env.GITHUB_TOKEN;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ultra-guru-fork-verifier",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    // Use the forks endpoint to check if the user has forked the repo
    // GitHub API: GET /repos/{owner}/{repo}/forks returns a list of forks
    // We search by username in pages
    let page = 1;
    let found = false;
    let forkUrl: string | null = null;

    // First, check the user's repo directly — fastest approach
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
      // Verify it's actually a fork of the target repo
      if (
        forkData.fork &&
        forkData.parent?.full_name === `${REPO_OWNER}/${REPO_NAME}`
      ) {
        found = true;
        forkUrl = forkData.html_url;
      }
    } else if (directCheck.status === 404) {
      // Repo doesn't exist under that name — check via forks list with pagination
      while (page <= 5 && !found) {
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

        const forks = await forksRes.json() as Array<{
          owner: { login: string };
          html_url: string;
        }>;

        if (!Array.isArray(forks) || forks.length === 0) break;

        const match = forks.find(
          (f) => f.owner.login.toLowerCase() === username.toLowerCase()
        );

        if (match) {
          found = true;
          forkUrl = match.html_url;
        }

        page++;
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
