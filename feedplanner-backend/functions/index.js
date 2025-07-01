/* eslint-disable max-len */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({origin: true});
const authMiddleware = require("./authMiddleware");
const pantryRoute = require("./routes/pantry");
const db = admin.firestore();
app.use(bodyParser.json());
app.use(authMiddleware);
app.use("/pantry", pantryRoute);
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
exports.api = functions.https.onRequest(app);
