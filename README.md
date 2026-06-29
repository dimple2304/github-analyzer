# GitHub Profile Analyzer API

A backend service that fetches public GitHub user data, extracts meaningful insights from their profile and repositories, and stores everything in a MySQL database.

Built with **Node.js**, **Express.js**, **MySQL**, and the **GitHub REST API**.

---

## Features

- Analyze any GitHub user by username
- Extracts and stores: followers, stars, top languages, account age, most starred repo, and more
- Re-analyze a profile anytime — it updates the existing record
- Pagination support on the list endpoint
- Simple HTML frontend to test without Postman
- Rate limiter to prevent abuse
- GitHub token support to avoid API rate limits

---

## Project Structure

```
github-analyzer/
├── src/
│   ├── app.js                    # Entry point
│   ├── config/
│   │   └── db.js                 # MySQL connection + table creation
│   ├── controllers/
│   │   └── profileController.js  # All business logic
│   ├── middleware/
│   │   └── rateLimiter.js        # Express rate limiter
│   ├── routes/
│   │   └── profileRoutes.js      # API route definitions
│   └── utils/
│       └── githubApi.js          # GitHub API calls + insights extraction
├── public/
│   └── index.html                # Simple HTML frontend
├── postman/
│   └── GitHub_Profile_Analyzer.postman_collection.json
├── schema.sql                    # Database schema export
├── .env.example                  # Environment variable template
├── .gitignore
├── package.json
└── README.md
```

---

## Setup Instructions

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/github-profile-analyzer.git
cd github-profile-analyzer
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
PORT=3000

# MySQL (local or Railway)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=github_analyzer

# Optional but recommended — avoids GitHub's 60 req/hour limit
GITHUB_TOKEN=ghp_your_token_here
```

> **GitHub Token:** Go to https://github.com/settings/tokens → Generate new token (classic) → No special scopes needed for public data.

### 4. Set up the database

**Option A — Auto setup (recommended)**  
The app creates the table automatically on startup. Just create the database first:

```sql
CREATE DATABASE github_analyzer;
```

**Option B — Import schema manually**

```bash
mysql -u root -p github_analyzer < schema.sql
```

### 5. Run the server

```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

Server starts at `http://localhost:3000`

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Check server status |
| `POST` | `/api/analyze/:username` | Analyze a GitHub user and save to DB |
| `GET` | `/api/profiles` | Get all stored profiles (paginated) |
| `GET` | `/api/profiles/:username` | Get a single stored profile |
| `DELETE` | `/api/profiles/:username` | Delete a stored profile |

### Query Parameters

`GET /api/profiles?page=1&limit=10`

---

## Example Requests

**Analyze a user:**
```bash
curl -X POST http://localhost:3000/api/analyze/torvalds
```

**Get all stored profiles:**
```bash
curl http://localhost:3000/api/profiles
```

**Get a specific profile:**
```bash
curl http://localhost:3000/api/profiles/torvalds
```

---

## Database Schema

See `schema.sql` for the full export.

Key columns stored per profile:

| Column | Description |
|--------|-------------|
| `username` | GitHub login (unique key) |
| `public_repos` | Total public repositories |
| `followers` / `following` | Follow counts |
| `total_stars` | Sum of stars across all own repos |
| `total_forks` | Sum of forks across all own repos |
| `top_languages` | Top 5 languages by repo count |
| `most_starred_repo` | Name of the most starred repo |
| `account_age_days` | Days since account creation |
| `hireable` | Whether the user is open to work |
| `analyzed_at` | Timestamp of last analysis |

---

## Deployment (Railway)

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Add a **MySQL** plugin to your project
4. Copy the Railway MySQL credentials into your environment variables
5. Set `NODE_ENV=production` and all `DB_*` variables in Railway's Variables tab
6. Railway auto-detects `npm start` as the start command

---

## Postman Collection

Import `postman/GitHub_Profile_Analyzer.postman_collection.json` into Postman.

Change the `base_url` collection variable to your deployed URL before testing.

---

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (via `mysql2`)
- **External API:** GitHub REST API v3
- **Other:** `axios`, `dotenv`, `cors`, `express-rate-limit`
