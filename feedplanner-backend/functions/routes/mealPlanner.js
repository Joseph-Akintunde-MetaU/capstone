const express = require("express");
const router = express.Router();
const admin = require("../firebaseAdmin");
const db = admin.firestore();

// GET meal plans for a user for a specific week
router.get("/", async (req, res) => {
  try {
    const userId = req.user.uid;
    const weekOf = req.query.weekOf;
    // Reference to the user's mealPlan collection
    const mealPlannerRef = db.collection("users").doc(userId).collection("mealPlan");
    // Query meal plans for the specified week
    const getMealPlannerRef = await mealPlannerRef.where("weekOf", "==", weekOf).get();
    // Map documents to response format
    const mealPlan = getMealPlannerRef.docs.map((plan) => ({
      id: plan.id,
      ...plan.data(),
    }));
    res.status(200).json(mealPlan);
  } catch (error) {
    res.status(500).json({error: "error"});
  }
});

// POST a new meal plan entry for a user
router.post("/", async (req, res) => {
  try {
    const userId = req.user.uid;
    const {recipeId, recipeName, dayOfTheWeek, mealType, ingredients} = req.body;
    // Calculate start of the week if not provided
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const weekOf = req.body.weekOf || startOfWeek.toISOString().split("T")[0];
    const mealPlannerRef = db.collection("users").doc(userId).collection("mealPlan");
    // Check if a meal already exists for the same slot
    const existing = await mealPlannerRef
      .where("dayOfTheWeek", "==", dayOfTheWeek)
      .where("mealType", "==", mealType)
      .where("weekOf", "==", weekOf)
      .get();
    if (!existing.empty) {
      res.status(409).json({"error": "You have already a meal for that slot"});
      return;
    }
    // Add new meal plan entry
    const getMealPlannerRef = await mealPlannerRef.add({
      recipeId,
      recipeName,
      dayOfTheWeek,
      mealType,
      weekOf,
      ingredients,
      createdAt: new Date(),
    });
    res.status(201).json({id: getMealPlannerRef.id});
  } catch (error) {
    res.status(501).json({error: "error"});
  }
});

// DELETE a meal plan entry by ID for a user
router.delete("/:mealPlannerId", async (req, res) => {
  try {
    const userId = req.user.uid;
    const {mealPlannerId} = req.params;
    // Reference to the specific meal plan document
    const mealPlannerRef = db.collection("users").doc(userId).collection("mealPlan").doc(mealPlannerId);
    await mealPlannerRef.delete();
    res.status(200).json({"message": `entry ${mealPlannerId} deleted`});
  } catch (error) {
    res.status(501).json({error: "error"});
  }
});

module.exports = router;
