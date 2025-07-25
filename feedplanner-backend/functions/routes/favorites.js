const express = require("express");
const router = express.Router();
const admin = require("../firebaseAdmin");
const db = admin.firestore();

// Route to add or remove a recipe from user's favorites
router.post("/", async (req, res) => {
  // Destructure recipe details and favorited status from request body
  const { recipeId, recipeName, ingredients, imageUrl, isFavorited } = req.body;
  // Get user ID from authenticated request
  const userId = req.user.uid;
  // Reference to the specific favorite document for the user
  const favoriteRef = db
    .collection("users")
    .doc(userId)
    .collection("favorites")
    .doc(recipeId.toString());

  try {
    if (isFavorited) {
      // If favorited, add/update the favorite document
      await favoriteRef.set({
        recipeId,
        recipeName,
        ingredients,
        imageUrl,
        favorited: true,
        timestamp: Date.now(),
      });
    } else {
      // If not favorited, remove the favorite document
      await favoriteRef.delete();
    }
    res.status(200).json({ message: "Favorite updated" });
  } catch (error) {
    // Handle errors during update
    res.status(500).json({ error: "Error updating favorite" });
  }
});

// Route to get all favorite recipe IDs for the user
router.get("/", async (req, res) => {
  // Get user ID from authenticated request
  const userId = req.user.uid;
  // Reference to the user's favorites collection
  const favoriteRef = db
    .collection("users")
    .doc(userId)
    .collection("favorites");

  try {
    // Fetch all favorite documents
    const snapshot = await favoriteRef.get();
    // Map to array of favorite recipe IDs
    const favorites = snapshot.docs.map((doc) => doc.id);
    res.status(200).json(favorites);
  } catch (error) {
    // Handle errors during fetch
    res.status(500).json({ error: "Error fetching favorites" });
  }
});

module.exports = router;
