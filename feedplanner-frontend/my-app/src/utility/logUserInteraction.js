import { doc,getDoc,setDoc} from "firebase/firestore";
import { db } from "../config/firebase.config.js";
export async function logUserInteraction(userId, type){
    const userInteractionRef = doc(db, "users", userId, "preferences", "weights")
    const getUserInteractionRef = await getDoc(userInteractionRef)

    const initialData = {
        match: 0,
        frequency: 0,
        rating: 0,
        urgency: 0,
        recency: 0,
        total: 0,
    }
    const data = getUserInteractionRef.exists() ? getUserInteractionRef.data() : initialData
    if(data[type] !== undefined){
        data[type] += 1
        data.total += 1
    }
    await setDoc(userInteractionRef, data)
}