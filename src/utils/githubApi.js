import axios from "axios";

const BASE_URL = "https://api.github.com";

function githubHeaders() {
  const headers = { "User-Agent": "GitHub-Profile-Analyzer" };
  if (process.env.GITHUB_TOKEN) {
    headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchUserProfile(username) {
  const { data } = await axios.get(`${BASE_URL}/users/${username}`, {
    headers: githubHeaders(),
  });
  return data;
}

async function fetchUserRepos(username) {
  const { data } = await axios.get(`${BASE_URL}/users/${username}/repos`, {
    headers: githubHeaders(),
    params: { per_page: 100, sort: "pushed" },
  });
  return data;
}

// Derive useful insights from the raw repos list
function extractRepoInsights(repos) {
  const languageCount = {};
  let totalStars = 0;
  let totalForks = 0;
  let mostStarredRepo = null;
  let mostStarredCount = 0;

  for (const repo of repos) {
    if (!repo.fork) {
      if (repo.language) {
        languageCount[repo.language] = (languageCount[repo.language] || 0) + 1;
      }
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;

      if (repo.stargazers_count > mostStarredCount) {
        mostStarredCount = repo.stargazers_count;
        mostStarredRepo = repo.name;
      }
    }
  }

  // Top 5 languages by frequency
  const topLanguages = Object.entries(languageCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([lang]) => lang)
    .join(", ");

  return { topLanguages, mostStarredRepo, mostStarredCount, totalStars, totalForks };
}

export { fetchUserProfile, fetchUserRepos, extractRepoInsights };
