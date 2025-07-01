/* eslint-disable max-len */
const express = require("express");
// eslint-disable-next-line new-cap
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
    res.status(500).json({error: "error"});
    console.error(error.message);
  }
});
// add to pantry items
router.post("/", async (req, res) => {
  try {
    const userId = req.user.uid;
    const {name, quantity, unit} = req.body;
    const pantryReference = db.collection("users").doc(userId).collection("pantry");
    const addPantryReferences = await pantryReference.add({
      name,
      quantity,
      unit,
      createdAt: new Date(),
    },
    );
    res.status(201).json({id: addPantryReferences.id});
  } catch (error) {
    console.error("Pantry item couldn't be added: ", error.message);
    res.status(500).json({error: error.message});
  }
});
// delete from pantry
router.delete("/:pantryId", async (req, res) => {
  try {
    const {pantryId} = req.params;
    const userId = req.user.uid;
    const pantryReference = db.collection("users").doc(userId).collection("pantry").doc(pantryId);
    await pantryReference.delete();
    res.status(200).json({message: `item ${pantryId} deleted`});
  } catch (error) {
    res.status(500).json({error: "error"});
    console.error(error.message);
  }
});
module.exports = router;
