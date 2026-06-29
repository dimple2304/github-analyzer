import { pool } from "../config/db.js";
import { fetchUserProfile, fetchUserRepos, extractRepoInsights } from "../utils/githubApi.js";

// POST /api/analyze/:username
async function analyzeProfile(req, res) {
  const { username } = req.params;

  try {
    // 1. Hit GitHub API
    const [profile, repos] = await Promise.all([
      fetchUserProfile(username),
      fetchUserRepos(username),
    ]);

    // 2. Crunch the repo insights
    const { topLanguages, mostStarredRepo, mostStarredCount, totalStars, totalForks } =
      extractRepoInsights(repos);

    // 3. Figure out account age in days
    const createdAt = new Date(profile.created_at);
    const accountAgeDays = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

    // 4. Upsert into MySQL (re-analyze = update existing record)
    const sql = `
      INSERT INTO github_profiles
        (username, name, bio, location, email, company, blog, avatar_url, profile_url,
         public_repos, public_gists, followers, following, top_languages,
         most_starred_repo, most_starred_count, total_stars, total_forks,
         account_age_days, hireable, twitter_handle, analyzed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        name = VALUES(name), bio = VALUES(bio), location = VALUES(location),
        email = VALUES(email), company = VALUES(company), blog = VALUES(blog),
        avatar_url = VALUES(avatar_url), public_repos = VALUES(public_repos),
        public_gists = VALUES(public_gists), followers = VALUES(followers),
        following = VALUES(following), top_languages = VALUES(top_languages),
        most_starred_repo = VALUES(most_starred_repo),
        most_starred_count = VALUES(most_starred_count),
        total_stars = VALUES(total_stars), total_forks = VALUES(total_forks),
        account_age_days = VALUES(account_age_days), hireable = VALUES(hireable),
        twitter_handle = VALUES(twitter_handle), analyzed_at = NOW()
    `;

    const values = [
      profile.login,
      profile.name || null,
      profile.bio || null,
      profile.location || null,
      profile.email || null,
      profile.company || null,
      profile.blog || null,
      profile.avatar_url || null,
      profile.html_url || null,
      profile.public_repos || 0,
      profile.public_gists || 0,
      profile.followers || 0,
      profile.following || 0,
      topLanguages || null,
      mostStarredRepo || null,
      mostStarredCount || 0,
      totalStars || 0,
      totalForks || 0,
      accountAgeDays || 0,
      profile.hireable ? 1 : 0,
      profile.twitter_username || null,
    ];

    await pool.query(sql, values);

    // 5. Return the stored data
    const [rows] = await pool.query("SELECT * FROM github_profiles WHERE username = ?", [
      profile.login,
    ]);

    return res.status(200).json({
      success: true,
      message: `Profile for '${username}' analyzed and stored successfully.`,
      data: rows[0],
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ success: false, message: `GitHub user '${username}' not found.` });
    }
    if (err.response?.status === 403) {
      return res.status(429).json({ success: false, message: "GitHub API rate limit hit. Add a GITHUB_TOKEN in .env to get higher limits." });
    }
    console.error("analyzeProfile error:", err.message);
    return res.status(500).json({ success: false, message: "Something went wrong.", error: err.message });
  }
}

// GET /api/profiles
async function getAllProfiles(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM github_profiles");
    const [rows] = await pool.query(
      "SELECT * FROM github_profiles ORDER BY analyzed_at DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );

    return res.status(200).json({
      success: true,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: rows,
    });
  } catch (err) {
    console.error("getAllProfiles error:", err.message);
    return res.status(500).json({ success: false, message: "Could not fetch profiles.", error: err.message });
  }
}

// GET /api/profiles/:username
async function getProfile(req, res) {
  const { username } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM github_profiles WHERE username = ?", [username]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No stored data for '${username}'. Analyze them first via POST /api/analyze/${username}`,
      });
    }

    return res.status(200).json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("getProfile error:", err.message);
    return res.status(500).json({ success: false, message: "Could not fetch profile.", error: err.message });
  }
}

// DELETE /api/profiles/:username
async function deleteProfile(req, res) {
  const { username } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM github_profiles WHERE username = ?", [username]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: `No record found for '${username}'.` });
    }

    return res.status(200).json({ success: true, message: `Profile '${username}' deleted.` });
  } catch (err) {
    console.error("deleteProfile error:", err.message);
    return res.status(500).json({ success: false, message: "Could not delete profile.", error: err.message });
  }
}

export default { analyzeProfile, getAllProfiles, getProfile, deleteProfile };
