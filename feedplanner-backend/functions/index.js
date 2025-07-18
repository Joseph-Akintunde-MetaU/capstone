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
const { onSchedule } = require("firebase-functions/scheduler");
const db = admin.firestore();
app.use(bodyParser.json());
app.use(authMiddleware);
app.use("/pantry", pantryRoute);
app.use("/mealPlanner", MealPlannerRoute);
app.use("/bookmark", bookmarkRoute);
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
async function runExpiryCheck(){
   const today = new Date();
      const millisecondsInADay =  24 * 60 * 60 * 1000;
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
          if (!type) continue;
          const existingNotification = await notificationsRef
              .where("itemId", "==", itemId)
              .where("type", "==", type)
              .where("read", "==", false)
              .limit(1)
              .get();
          if (!existingNotification.empty) continue;
          const message =
          type === "expired" ? `${item.name} has expired` : `${item.name} will expire soon`;
          await notificationsRef.add({
            message,
            itemId,
            type,
            read: false,
            createdAt: new Date(),
          });
          if (type === "expired") {
            await pantryRef.doc(itemId).update({expired: true});
          }
        }
      }
      return null
}
exports.checkExpiryScheduled = onSchedule ("every 2 hours", async () => {
      await runExpiryCheck()
    });
exports.api = functions.https.onRequest(app);
