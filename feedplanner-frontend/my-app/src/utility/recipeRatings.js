import { db } from "../config/firebase.config.js";
import { doc, collection,getDocs, updateDoc,runTransaction } from "firebase/firestore";
import { getMedian } from "./getMedian.js";
export async function RecipeRatings(recipeId, userId, newRatingValue){
    const recipeRef = doc(db, "recipeRatings", recipeId.toString())
    const userRatingRef = doc(db, "recipeRatings", recipeId.toString(), "userRatings", userId)
    
    await runTransaction(db, async (rating) => {
        const recipeSnap = await rating.get(recipeRef)
        const userSnap = await rating.get(userRatingRef)
        let ratingTotal = 0
        let ratingCount = 0
        if(recipeSnap.exists()){
            ratingTotal = recipeSnap.data().ratingTotal || 0
            ratingCount = recipeSnap.data().ratingCount || 0
        }
        if(userSnap.exists()){
            const oldValue = userSnap.data().value;
            ratingTotal = ratingTotal - oldValue + newRatingValue
        }else{
            ratingTotal += newRatingValue;
            ratingCount += 1
        }
        const averageRatingOfAllUsers = ratingCount === 0 ? 0: ratingTotal/ratingCount
        rating.set(userRatingRef, {
            value: newRatingValue,
            updatedAt: Date.now()
        });
        rating.set(recipeRef, {
            ratingTotal,
            ratingCount,
            averageRatingOfAllUsers,
        }, { merge: true });
    })
    let allRatings = [];
    const userRatingsRef = collection(db, "recipeRatings", recipeId.toString(), "userRatings");
    const userRatingsSnap = await getDocs(userRatingsRef);
    userRatingsSnap.forEach(doc => {
    allRatings.push(doc.data().value);
    });
    let medianRating = getMedian(allRatings);
    await updateDoc(recipeRef, { medianRating });
}