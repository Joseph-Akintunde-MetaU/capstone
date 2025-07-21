/* eslint-disable max-len */
/* eslint-disable new-cap */
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
router.post("/", async (req, res) => {
  const {recipeId, recipeName, ingredients, imageUrl, isFavorited} = req.body;
  const userId = req.user.uid;
  const favoriteRef = db.collection("users").doc(userId).collection("favorites").doc(recipeId.toString());
  try {
    if (isFavorited) {
      await favoriteRef.set({
        recipeId,
        recipeName,
        ingredients,
        imageUrl,
        favorited: true,
        timestamp: Date.now(),
      });
    } else {
      await favoriteRef.delete();
    }
    res.status(200).json("favorite updated");
  } catch (error) {
    res.status(500).json({error: "error"});
    console.error(error);
  }
});
router.get("/", async (req, res) => {
  const userId = req.user.uid;
  const favoriteRef = db.collection("users").doc(userId).collection("favorites");
  const getFavorite = await favoriteRef.get();
  const favorite = getFavorite.docs.map((favorite) => favorite.id);
  res.status(201).json(favorite);
});
module.exports = router;
