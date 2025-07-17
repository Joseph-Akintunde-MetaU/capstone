/* eslint-disable no-unused-vars */
/* eslint-disable no-trailing-spaces */
/* eslint-disable max-len */
/* eslint-disable new-cap */
const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
// get all pantry items
router.get("/", async (req, res) => {
  try {
    const userId = req.user.uid;
    const pantryReference = db.collection("users").doc(userId).collection("pantry");
    const getPantryReference = await pantryReference.get();
    const PantryItems = getPantryReference.docs.map((pantry) => ({
      id: pantry.id,
      ...pantry.data(),
    }));
    res.status(200).json(PantryItems);
  } catch (error) {
    res.status(501).json({error: "error"});
    console.error(error.message);
  }
});
router.get("/ingredients", async (req, res) => {
  try {
    const userId = req.user.uid;
    const pantryCollection = db.collection("users").doc(userId).collection("pantry");
    const getPantryCollection = await pantryCollection.get();
    const ingredientsArray = getPantryCollection.docs
        .map((doc) => doc.data())
        .filter((item) => item.name && new Date(`${item.expiryDate}T23:59:59`) >= new Date())
        .map((item) => item.name.trim().toLowerCase());
    const expiredIngredientsArray = getPantryCollection.docs
        .map((doc) => doc.data())
        .filter((item) => item.name && new Date(`${item.expiryDate}T23:59:59`) <= new Date())
        .map((item) => item.name.trim().toLowerCase());
    const stringedIngredients = ingredientsArray.join(",+");
    res.status(201).json({Ingredients: stringedIngredients, ExpiredIngredients: expiredIngredientsArray});
  } catch (error) {
    console.error(error.message);
    res.status(500).json({error: "error"});
  }
});

// add to pantry items
router.post("/", async (req, res) => {
  try {
    const userId = req.user.uid;
    const {name, quantity, unit, expiryDate} = req.body;
    const pantryReference = db.collection("users").doc(userId).collection("pantry");
    const addPantryReferences = await pantryReference.add({
      name,
      quantity,
      unit,
      expiryDate,
      createdAt: new Date(),
    },
    );
    res.status(201).json({id: addPantryReferences.id});
  } catch (error) {
    console.error("Pantry item couldn't be added: ", error.message);
    res.status(501).json({error: error.message});
  }
});
// delete from pantry
router.delete("/:pantryId", async (req, res) => {
  try {
    const {pantryId} = req.params;
    const userId = req.user.uid;
    const pantryReference = db.collection("users").doc(userId).collection("pantry").doc(pantryId);
    // eslint-disable-next-line no-unused-vars
    const deletePantryReference = await pantryReference.delete();
    res.status(200).json({message: `item ${pantryId} deleted`});
  } catch (error) {
    res.status(501).json({error: "error"});
    console.error(error.message);
  }
});
router.patch("/:pantryId", async (req, res) => {
  const userId = req.user.uid;
  const {pantryId} = req.params;
  const allowedFields = ["name", "quantity", "unit", "expiryDate"];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });
  if (Object.keys(updates).length === 0) {
    res.status(400).json({error: "no valid fields provided"});
  }
  try {
    const pantryReference = db.collection("users").doc(userId).collection("pantry").doc(pantryId).update(updates);
    res.status(200).json({success: true, updates: updates});
  } catch (error) {
    res.status(500).json({error: error});
  }
});
module.exports = router;
