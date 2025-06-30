const admin = require('firebase-admin')
//function to validate routes after log in in order to proceed to next route. almost like a gatekeeper to make sure it's a particular user's token.
module.exports = async(req, res, next ) => {
        const authorizationHeader = req.get("Authorization")
        const token = authorizationHeader.split('Bearer ')[1]
        try{
            //verify the token
            const decodedToken = await admin.auth().verifyIdToken(token)
            if(decodedToken){
                req.user = decodedToken
                next()
            }
        }catch(error){
                console.log("Error on validating: ", error)
                return res.status(402).json({error: error.message, status: "un-Authorized"})
        }
    }