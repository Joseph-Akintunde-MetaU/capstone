const admin = require("firebase-admin");

module.exports = async (req, res, next) => {
  const authorizationHeader = req.get("Authorization");
  const token = authorizationHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (decodedToken) {
      req.user = decodedToken;
      next();
    }
  } catch (error) {
    return res.status(402).json({ error: error.message, status: "un-Authorized" });
  }
};
