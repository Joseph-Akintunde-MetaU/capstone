/* eslint-disable require-jsdoc */
/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable new-cap */
/* eslint-disable no-unused-vars */
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
// to get all the planned meals
async function userIdAndMealPlannerReference() {
  const userId = req.user.uid;
  const mealPlannerRef = db.collection("users").doc(userId).collection("mealPlan");
}
router.get("/", async (req, res) => {
  try {
    const reference = await userIdAndMealPlannerReference();
    const getMealPlannerRef = await mealPlannerRef.get();
    const mealPlan = getMealPlannerRef.docs.map((plan) => ({
      id: plan.id,
      ...plan.data(),
    }));
    res.status(200).json(mealPlan);
  } catch (error) {
    res.status(500).json({error: "error"});
    console.error(error);
  }
});
router.post("/", async (req, res) => {
  try {
    const {recipeId, recipeName, dayOfTheWeek, mealType, weekOf} = req.body;
    const reference = await userIdAndMealPlannerReference();
    const getMealPlannerRef = await mealPlannerRef.add({
      recipeId,
      recipeName,
      dayOfTheWeek,
      mealType,
      weekOf,
      createdAt: new Date(),
    });
    res.status(201).json({id: getMealPlannerRef.id});
  } catch (error) {
    res.status(501).json({errror: "error"});
    console.error(error);
  }
});
router.delete("/mealPlannerId", async (req, res) => {
  try {
    const {mealPlannerId} = req.params;
    const reference = await userIdAndMealPlannerReference();
    const deleteMealPlannerRef = await mealPlannerRef.delete();
    res.status(200).json({"message": "entry deleted"});
  } catch (error) {
    res.status(501).json({error: "error"});
  }
});
module.exports = router;
