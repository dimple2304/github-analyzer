import express from "express";

import profileController from "../controllers/profileController.js";

const {
  analyzeProfile,
  getAllProfiles,
  getProfile,
  deleteProfile,
} = profileController;

const router = express.Router();

// Analyze (or re-analyze) a GitHub user and save to DB
router.post("/analyze/:username", analyzeProfile);

// Get all stored profiles
router.get("/profiles", getAllProfiles);

// Get a single stored profile
router.get("/profiles/:username", getProfile);

// Delete a stored profile
router.delete("/profiles/:username", deleteProfile);

export default router;