const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const functions = require("firebase-functions");
const admin = require("./firebaseAdmin");
const cors = require("cors")({origin: true});
const authMiddleware = require("./authMiddleware");
const pantryRoute = require("./routes/pantry");
const MealPlannerRoute = require("./routes/mealPlanner");
const favoriteRoute = require("./routes/favorites");
const {onSchedule} = require("firebase-functions/scheduler");
const SubstitionNutritionEngine = require("./substituteNotificationEngine");
const db = admin.firestore();
app.use(bodyParser.json());
app.use(authMiddleware);
app.use("/pantry", pantryRoute);
app.use("/mealPlanner", MealPlannerRoute);
app.use("/favorites", favoriteRoute);

exports.validateUserJWTToken = functions.https.onRequest(async (req, res) => {
  cors(req, res, async () => {
    const authorizationHeader = req.get("Authorization");
    const token = authorizationHeader.split("Bearer ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
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
      return res.status(402).json({error: error.message, status: "un-Authorized"});
    }
  });
});

app.post("/substitutes", async (req, res) => {
  try {
    const userId = req.user.uid;
    const {expiredName, topSubs = 2, weights} = req.body;
    const subs = await SubstitionNutritionEngine.findTopSubstitutes(
        expiredName,
        userId,
        topSubs,
        weights ? {overrideWeights: weights} : {},
    );
    return res.status(200).json(subs);
  } catch (error) {
    return res.status(500).json({error: error.message});
  }
});

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
      const item = pantryItem.data();
      const itemId = pantryItem.id;
      const expiry = item.expiryDate && item.expiryDate.toDate?
          item.expiryDate.toDate() :
          new Date(item.expiryDate);
      const daysLeft = expiry-today;
      let type = null;
      if (daysLeft<0) {
        type = "expired";
      } else if (daysLeft <= millisecondsInADay) {
        type = "expiring soon";
      }
      if (!type) {
        continue;
      }
      const existingNotification = await notificationsRef
          .where("itemId", "==", itemId)
          .where("type", "==", type)
          .where("read", "==", false)
          .limit(1)
          .get();
      if (!existingNotification.empty) {
        continue;
      }
      const message =
          type === "expired" ? `${item.name} has expired` : `${item.name} will expire soon`;
      let top2Substitutes = [];
      if (type === "expired") {
        try {
          const subs = await SubstitionNutritionEngine.findTopSubstitutes(
              item.name
              ,2
          );
          top2Substitutes = subs.map((s) => s.name);
        } catch (error) {}
      }
      const getMealPlan = await db
        .collection("users")
        .doc(userId)
        .collection("mealPlan")
        .where("ingredients", "array-contains", item.name)
        .get();
      const affectedRecipes = getMealPlan.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      const notificationData = {
        message,
        itemId,
        type,
        read: false,
        createdAt: new Date(),
        expiredIngredient: item.name,
        affectedRecipes: affectedRecipes,
        substitutes: type === "expired" ? top2Substitutes : [],
      };
      await notificationsRef.add(notificationData);
      if (type === "expired") {
        await pantryRef.doc(itemId).update({expired: true});
      }
    }
  }
  return null;
}

exports.checkExpiryScheduled = onSchedule({
  schedule: "every 2 minutes",
  timeZone: "America/Los_Angeles",
}, async () => {
  await runExpiryCheck();
});

exports.api = functions.https.onRequest(app);
