import { db } from "../config/firebase.config.js";
import { doc, collection,getDocs, updateDoc,runTransaction } from "firebase/firestore";
export async function RecipeRatings(recipeId, recipeName, userId, newRatingValue){
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
            recipeName,
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
    allRatings.sort((a, b) => a - b);
    let medianRating = null;
    const len = allRatings.length;
    if (len === 0) {
        medianRating = 0;
    } else if (len % 2 === 1) {
        medianRating = allRatings[Math.floor(len / 2)];
    } else {
        medianRating = (allRatings[len / 2 - 1] + allRatings[len / 2]) / 2;
    }
    await updateDoc(recipeRef, { medianRating });
}