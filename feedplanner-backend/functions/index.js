/* eslint-disable require-jsdoc */
/* eslint-disable func-call-spacing */
/* eslint-disable no-unexpected-multiline */
/* eslint-disable no-unused-vars */
/* eslint-disable max-len */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
const authMiddleware = require("./authMiddleware");
const pantryRoute = require("./routes/pantry");
const MealPlannerRoute = require("./routes/mealPlanner");
const bookmarkRoute = require("./routes/bookmark");
const {onSchedule} = require("firebase-functions/scheduler");
const db = admin.firestore();
app.use(bodyParser.json());
app.use(authMiddleware);
app.use("/pantry", pantryRoute);
app.use("/mealPlanner", MealPlannerRoute);
app.use("/bookmark", bookmarkRoute);
const apiKey = process.env.REACT_APP_API_KEY;
// creating a new cloud function that's triggered by an https request.
exports.validateUserJWTToken = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    // authorization - bearer token to ensure authentication
    const authorizationHeader = req.get("Authorization");
    const token = authorizationHeader.split("Bearer ")[1];
    try {
      // verify the token
      const decodedToken = await admin.auth().verifyIdToken(token);
      // and after that, retrieves user data with unique uid. if the user doesnt exist, this adds the token and its details to a collection called users in my database.
      if (decodedToken) {
        const docReference = db.collection("users").doc(decodedToken.uid);
        const doc = await docReference.get();
        if (!doc.exists) {
          const userRef = db.collection("users").doc(decodedToken.uid);
          await userRef.set(decodedToken);
        }
        return res.status(200).json({success: true, user: decodedToken});
      }
    } catch (error) {
      console.log("Error on validating: ", error);
      return res.status(402).json({error: error.message, status: "un-Authorized"});
    }
  });
});
function dot(a, b) {
  return a.reduce((sum, val, i) => sum + val * b[i], 0);
}
function magnitude(v) {
  return Math.sqrt(v.reduce((sum, val) => sum + val * val, 0));
}
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);
  if (magA === 0 || magB === 0) return 0;
  return dot(vecA, vecB) / (magA * magB);
}
async function fecthIngredientId(ingredient) {
  const response = await fetch(`https://api.spoonacular.com/food/ingredients/search?apiKey=${apiKey}&query=${encodeURIComponent(ingredient)}&number=1`);
  const data = await response.json();
  return data.results[0].id;
}
async function nutritionVector(ingredient) {
  const id = await fecthIngredientId(ingredient);
  if (!id) throw new Error("ID not found");
  const tasteResponse = await fetch(`https://api.spoonacular.com/food/ingredients/${id}/information?apiKey=${apiKey}&amount=100&unit=gram`);
  const data = await tasteResponse.json();
  const nutrients = data.nutrition.nutrients || [];
  const get = (n) => nutrients.find((item) => item.name === n).amount || 0;
  return [
    get("Calories"),
    get("Protein"),
    get("Fat"),
    get("Carbohydrates"),
    get("Sugar"),
    get("Fiber"),
    get("Sodium"),
    get("Vitamin C"),
    get("Magnesium"),
    get("Potassium"),
    get("Vitamin E"),
    get("Vitamin A"),
  ];
}
async function getSubstitutes(ingredient) {
  const response = await fetch(`https://api.spoonacular.com/food/ingredients/substitutes?apiKey=${apiKey}&ingredientName=${encodeURIComponent(ingredient)}`);
  const data = await response.json();
  return data.substitutes || [];
}
async function getExpiryType(expiry, today, millisecondsInADay) {
  const daysLeft = expiry - today;
  if (daysLeft < 0) return "expired";
  if (daysLeft <= millisecondsInADay) return "expiring soon";
  return null;
}

async function getExistingNotification(notificationsRef, itemId, type) {
  return await notificationsRef
    .where("itemId", "==", itemId)
    .where("type", "==", type)
    .where("read", "==", false)
    .limit(1)
    .get();
}

async function getTop2Substitutes(item) {
  try {
    const originalVector = await nutritionVector(item.name);
    const substitutes = await getSubstitutes(item.name);
    const scored = await Promise.all(
      substitutes.map(async (sub) => {
        try {
          const subVector = await nutritionVector(sub);
          return {
            name: sub,
            score: cosineSimilarity(originalVector, subVector),
          };
        } catch (error) {
          if (
            item.name.toLowerCase().includes(sub.toLowerCase()) ||
            sub.toLowerCase().includes(item.name.toLowerCase())
          ) {
            return {
              name: sub,
              score: 1,
            };
          }
          return {
            name: sub,
            score: 0,
          };
        }
      }),
    );
    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((s) => s.name.split("=")[1]);
  } catch (error) {
    console.error("substitution error");
    return [];
  }
}

async function getAffectedRecipes(db, userId, itemName) {
  const getMealPlan = await db
    .collection("users")
    .doc(userId)
    .collection("mealPlan")
    .where("ingredients", "array-contains", itemName)
    .get();
  return getMealPlan.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

async function processPantryItem({
  pantryItem,
  pantryRef,
  notificationsRef,
  today,
  millisecondsInADay,
  db,
  userId,
}) {
  const item = pantryItem.data();
  const itemId = pantryItem.id;
  const expiry =
    item.expiryDate && item.expiryDate.toDate
      ? item.expiryDate.toDate()
      : new Date(item.expiryDate);

  const type = await getExpiryType(expiry, today, millisecondsInADay);
  if (!type) return;

  const existingNotification = await getExistingNotification(
    notificationsRef,
    itemId,
    type,
  );
  if (!existingNotification.empty) return;

  const message =
    type === "expired"
      ? `${item.name} has expired`
      : `${item.name} will expire soon`;

  let top2Substitutes = [];
  if (type === "expired") {
    top2Substitutes = await getTop2Substitutes(item);
  }

  const affectedRecipes = await getAffectedRecipes(db, userId, item.name);

  await notificationsRef.add({
    message,
    itemId,
    type,
    read: false,
    createdAt: new Date(),
    expiredIngredient: item.name,
    substitutes: top2Substitutes,
    affectedRecipes: affectedRecipes,
  });

  if (type === "expired") {
    await pantryRef.doc(itemId).update({ expired: true });
  }
}

async function runExpiryCheck() {
  const today = new Date();
  const millisecondsInADay = 24 * 60 * 60 * 1000;
  const getUsers = await db.collection("users").get();
  for (const userDoc of getUsers.docs) {
    const userId = userDoc.id;
    const pantryRef = db.collection("users").doc(userId).collection("pantry");
    const getpantryRef = await pantryRef.get();
    const notificationsRef = db.collection("users").doc(userId).collection("notifications");
    for (const pantryItem of getpantryRef.docs) {
      await processPantryItem({
        pantryItem,
        pantryRef,
        notificationsRef,
        today,
        millisecondsInADay,
        db,
        userId,
      });
    }
  }
  return null;
}

exports.checkExpiryScheduled = onSchedule({
  schedule: "every 2 hours",
  timeZone: "America/Los_Angeles",
}, async () => {
  await runExpiryCheck();
});
exports.api = functions.https.onRequest(app);
