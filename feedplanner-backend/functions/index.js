const functions = require("firebase-functions")
const admin = require("firebase-admin")

const cors = require("cors")({origin: true})

admin.initializeApp()
const db = admin.firestore();
//creating a new cloud function that's triggered by an https request.
exports.validateUserJWTToken = functions.https.onRequest(async (req,res) => {
    cors(req,res, async () => {
        //authorization - bearer token to ensure authentication
        const authorizationHeader = req.get("Authorization")
        if(!authorizationHeader || !authorizationHeader.startsWith('Bearer ')){
            return res.status(401).json({error: "Unauthorized"})
        }
        const token = authorizationHeader.split('Bearer ')[1]
        try{
            //verify the token
            const decodedToken = await admin.auth().verifyIdToken(token)
            //and after that, retrieves user data with unique uid. if the user doesnt exist, this adds the token and its details to a collection called users in my database.
            if(decodedToken){
                const docRef = db.collection("users").doc(decodedToken.uid)
                const doc = await docRef.get()
                if(!doc.exists){
                    const userRef = db.collection("users").doc(decodedToken.uid)
                    await userRef.set(decodedToken)
                }
                return res.status(200).json({success: true, user: decodedToken})
            }
        }catch(error){
            console.log("Error on validating: ", error)
            return res.status(402).json({error: error.message, status: "un-Authorized"})
        }
    })
})
