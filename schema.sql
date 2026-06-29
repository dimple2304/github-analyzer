-- ============================================================
-- GitHub Profile Analyzer — Database Schema
-- Compatible with: MySQL 8.0+ / MariaDB / Railway / PlanetScale
-- ============================================================

CREATE DATABASE IF NOT EXISTS github_analyzer;
USE github_analyzer;

CREATE TABLE IF NOT EXISTS github_profiles (
  id                  INT AUTO_INCREMENT PRIMARY KEY,

  -- Identity
  username            VARCHAR(100)  NOT NULL UNIQUE,
  name                VARCHAR(200),
  bio                 TEXT,
  location            VARCHAR(200),
  email               VARCHAR(200),
  company             VARCHAR(200),
  blog                VARCHAR(500),
  avatar_url          VARCHAR(500),
  profile_url         VARCHAR(500),
  twitter_handle      VARCHAR(100),
  hireable            TINYINT(1) COMMENT '1 = open to work, 0 = not',

  -- Core GitHub stats
  public_repos        INT DEFAULT 0,
  public_gists        INT DEFAULT 0,
  followers           INT DEFAULT 0,
  following           INT DEFAULT 0,

  -- Derived insights (from repos analysis)
  top_languages       TEXT         COMMENT 'Comma-separated list of top 5 languages',
  most_starred_repo   VARCHAR(200),
  most_starred_count  INT DEFAULT 0,
  total_stars         INT DEFAULT 0 COMMENT 'Sum of stars across all own repos',
  total_forks         INT DEFAULT 0 COMMENT 'Sum of forks across all own repos',
  account_age_days    INT DEFAULT 0 COMMENT 'Days since GitHub account creation',

  -- Timestamps
  analyzed_at         DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Index for fast lookups
CREATE INDEX idx_username ON github_profiles (username);
CREATE INDEX idx_followers ON github_profiles (followers);
CREATE INDEX idx_analyzed_at ON github_profiles (analyzed_at);
