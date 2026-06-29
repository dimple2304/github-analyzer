# GitHub Profile Analyzer API

Ever wondered how to pull meaningful insights from a GitHub profile beyond just the bio? This project does exactly that — give it a username, and it fetches their public GitHub data, extracts useful stats, and saves everything to a MySQL database for later retrieval.

Built with **Node.js**, **Express.js**, **MySQL**, and the **GitHub REST API**.

## What it does

- Analyze any GitHub user just by passing their username
- Pulls and stores things like follower count, total stars, top languages, account age, most starred repo, and more
- If you analyze the same user again, it updates their record instead of creating a duplicate
- Supports pagination when listing all stored profiles
- Comes with a simple HTML frontend so you can test it without opening Postman
- Has a rate limiter built in so the API doesn't get hammered
- Supports a GitHub token to avoid the 60 req/hour limit on unauthenticated requests


## Project Structure

github-analyzer/
├── src/
│   ├── app.js                    # Entry point
│   ├── config/
│   │   └── db.js                 # MySQL connection + table auto-creation
│   ├── controllers/
│   │   └── profileController.js  # All the business logic lives here
│   ├── middleware/
│   │   └── rateLimiter.js        # Rate limiting middleware
│   ├── routes/
│   │   └── profileRoutes.js      # Route definitions
│   └── utils/
│       └── githubApi.js          # GitHub API calls + insight extraction
├── public/
│   └── index.html                # Simple HTML frontend
├── postman/
│   └── GitHub_Profile_Analyzer.postman_collection.json
├── schema.sql                    # Database schema
├── .env.example                  # Copy this to .env and fill in your values
├── .gitignore
├── package.json
└── README.md


## Getting Started

### 1. Clone the repo

bash
git clone https://github.com/dimple2304/github-analyzer.git
cd github-analyzer

### 2. Install dependencies

bash
npm install

### 3. Set up environment variables

bash
cp .env.example .env

Open `.env` and fill in your values:

env
PORT=3000

# MySQL connection
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=github_analyzer

# Optional but highly recommended — without this you're limited to 60 requests/hour
GITHUB_TOKEN=ghp_your_token_here

> To get a GitHub token: go to [github.com/settings/tokens](https://github.com/settings/tokens) → Generate new token (classic) → you don't need any special scopes for public data.

### 4. Set up the database

The easiest way — just create the database and let the app handle the rest:

sql
CREATE DATABASE github_analyzer;

The table gets created automatically when the server starts. Or if you prefer doing it manually:

bash
mysql -u root -p github_analyzer < schema.sql

### 5. Start the server

bash
# Development (auto-restarts on changes)
npm run dev

# Production
npm start

Server runs at `http://localhost:3000`


## API Endpoints

| Method | Endpoint | What it does |
|--------|----------|-------------|
| `GET`  | `/health` | Check if the server is up |
| `POST` | `/api/analyze/:username` | Analyze a GitHub user and save to DB |
| `GET`  | `/api/profiles` | List all stored profiles (paginated) |
| `GET`  | `/api/profiles/:username` | Get a single stored profile |
| `DELETE` | `/api/profiles/:username` | Delete a stored profile |

Pagination: `GET /api/profiles?page=1&limit=10`


## Example Requests

bash
# Analyze a user
curl -X POST http://localhost:3000/api/analyze/torvalds

# Get all stored profiles
curl http://localhost:3000/api/profiles

# Get one profile
curl http://localhost:3000/api/profiles/torvalds


## What gets stored in the database

| Column | Description |
|--------|-------------|
| `username` | GitHub login (unique) |
| `public_repos` | Total public repositories |
| `followers` / `following` | Follow counts |
| `total_stars` | Sum of stars across all their repos |
| `total_forks` | Sum of forks across all their repos |
| `top_languages` | Top 5 languages by repo count |
| `most_starred_repo` | Their most starred repository |
| `account_age_days` | Days since the account was created |
| `hireable` | Whether they're open to work |
| `analyzed_at` | When we last analyzed them |

Full schema in `schema.sql`.


## Deploying to Railway

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Add a **MySQL** database to your project
4. Copy the MySQL credentials Railway gives you into your environment variables
5. Add `NODE_ENV=production` and all the `DB_*` variables in the Variables tab
6. Railway picks up `npm start` automatically — no extra config needed


## Testing with Postman

Import `postman/GitHub_Profile_Analyzer.postman_collection.json` into Postman and update the `base_url` variable to your deployed URL. All endpoints are pre-configured and ready to run.


## Tech Stack

- **Node.js** + **Express.js** — server and routing
- **MySQL** (via `mysql2`) — data storage
- **GitHub REST API v3** — profile and repo data
- **axios**, **dotenv**, **cors**, **express-rate-limit** — supporting libraries