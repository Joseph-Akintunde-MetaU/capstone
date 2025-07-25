const express = require("express");
const router = express.Router();
const admin = require("../firebaseAdmin");
const db = admin.firestore();

// Get all pantry items
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
    res.status(501).json({ error: "error" });
    console.error(error.message);
  }
});

// Get pantry ingredients as a string
router.get("/ingredients", async (req, res) => {
  try {
    const userId = req.user.uid;
    const pantryCollection = db.collection("users").doc(userId).collection("pantry");
    const getPantryCollection = await pantryCollection.get();
    const ingredientsArray = getPantryCollection.docs
      .map((doc) => doc.data())
      .filter((item) => item.name && new Date(item.expiryDate) >= new Date())
      .map((item) => item.name.trim().toLowerCase());
    const stringedIngredients = ingredientsArray.join(",+");
    res.status(200).json({ Ingredients: stringedIngredients });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "error" });
  }
});

// Add a pantry item
router.post("/", async (req, res) => {
  try {
    const userId = req.user.uid;
    const { name, quantity, unit, expiryDate } = req.body;
    const pantryReference = db.collection("users").doc(userId).collection("pantry");
    const addPantryReferences = await pantryReference.add({
      name,
      quantity,
      unit,
      expiryDate: new Date(expiryDate).toISOString(),
      createdAt: new Date(),
    });
    res.status(201).json({ id: addPantryReferences.id });
  } catch (error) {
    console.error("Pantry item couldn't be added: ", error.message);
    res.status(501).json({ error: error.message });
  }
});

// Delete a pantry item
router.delete("/:pantryId", async (req, res) => {
  try {
    const { pantryId } = req.params;
    const userId = req.user.uid;
    const pantryReference = db.collection("users").doc(userId).collection("pantry").doc(pantryId);
    await pantryReference.delete();
    res.status(200).json({ message: `item ${pantryId} deleted` });
  } catch (error) {
    res.status(501).json({ error: "error" });
    console.error(error.message);
  }
});

// Update a pantry item
router.patch("/:pantryId", async (req, res) => {
  try {
    const userId = req.user.uid;
    const { pantryId } = req.params;
    const allowedFields = ["name", "quantity", "unit", "expiryDate"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: "no valid fields provided" });
    }
    const pantryReference = db.collection("users").doc(userId).collection("pantry").doc(pantryId);
    await pantryReference.update(updates);
    res.status(200).json({ success: true, updates: updates });
  } catch (error) {
    res.status(500).json({ error: error });
  }
});

module.exports = router;
