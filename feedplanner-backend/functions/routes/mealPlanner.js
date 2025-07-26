/* eslint-disable no-restricted-globals */
/* eslint-disable no-undef */
/* eslint-disable max-len */
/* eslint-disable new-cap */
/* eslint-disable no-unused-vars */
const express = require("express");
const router = express.Router();
const admin = require("../firebaseAdmin");
const db = admin.firestore();
router.get("/", async (req, res) => {
  try {
    const userId = req.user.uid;
    const weekOf = req.query.weekOf;
    const mealPlannerRef = db.collection("users").doc(userId).collection("mealPlan");
    const getMealPlannerRef = await mealPlannerRef.where("weekOf", "==", weekOf).get();
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
    const {recipeId, recipeName, dayOfTheWeek, mealType, ingredients} = req.body;
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
      ingredients,
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
