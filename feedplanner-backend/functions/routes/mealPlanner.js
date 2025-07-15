/* eslint-disable no-undef */
/* eslint-disable require-jsdoc */
/* eslint-disable no-unused-vars */
/* eslint-disable new-cap */
/* eslint- no-unused-vars */
/* eslint- require-jsdoc */
/* eslint- no-restricted-globals */
/* eslint- max-len */
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const db = admin.firestore();
// to get all the planned meals
async function userIdAndMealPlannerReference() {
  const userId = req.user.uid;
  const mealPlannerRef =
  db.collection("users").doc(userId).collection("mealPlan");
}
router.get("/", async (req, res) => {
  try {
    const mealPlannerRef = await userIdAndMealPlannerReference();
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
    const userId = req.user.uid;
    const {recipeId, recipeName, dayOfTheWeek, mealType} = req.body;
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const weekOf = req.body.weekOf || startOfWeek.toISOString().split("T")[0];
    const mealPlannerRef = db.collection("users").doc(userId).collection("mealPlan");
    const existing = await mealPlannerRef.where("dayOfTheWeek", "==", dayOfTheWeek).where("mealType", "==", mealType).where("weekOf", "==", weekOf).get();
    if (!existing.empty) {
      res.status(409).json({"error": "You have already a meal for that slot"});
    }
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
router.delete("/:mealPlannerId", async (req, res) => {
  try {
    const userId = req.user.uid;
    const {mealPlannerId} = req.params;
    const mealPlannerRef = db.collection("users").doc(userId).collection("mealPlan").doc(mealPlannerId);
    const deleteMealPlannerRef = await mealPlannerRef.delete();
    res.status(200).json({"message": `entry ${mealPlannerId} deleted`});
  } catch (error) {
    res.status(501).json({error: "error"});
  }
});
module.exports = router;
