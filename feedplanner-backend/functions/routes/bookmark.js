/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable new-cap */
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
router.post("/", async (req, res) => {
  const {recipeId, isBookmarked} = req.body;
  const userId = req.user.uid;
  const bookmarkRef = db.collection("users").doc(userId).collection("bookmarks").doc(recipeId.toString());
  try {
    if (isBookmarked) {
      await bookmarkRef.set({bookmarked: true, Timestamp: Date.now()});
    } else {
      await bookmarkRef.delete();
    }
    res.status(200).json("bookmark updated");
  } catch (error) {
    res.status(500).json({error: "error"});
    console.error(error);
  }
});
router.get("/", async (req, res) => {
  const userId = req.user.uid;
  const bookmarkRef = db.collection("users").doc(userId).collection("bookmarks");
  const getBookmark = await bookmarkRef.get();
  const bookmark = getBookmark.docs.map((bookmark) => bookmark.id);
  res.status(201).json(bookmark);
});
module.exports = router;
