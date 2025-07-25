import { doc,getDoc,setDoc} from "firebase/firestore";
import { db } from "../config/firebase.config.js";
export async function logUserInteraction(userId, type, value = 1) {
    const userInteractionRef = doc(db, "users", userId, "preferences", "weights");
    const getUserInteractionRef = await getDoc(userInteractionRef);

    const initialData = {
        match: 0,
        frequency: 0,
        rating: 0,
        urgency: 0,
        recency: 0,
        total: 0,
    };
    const data = getUserInteractionRef.exists() ? getUserInteractionRef.data() : initialData;
    if (data[type] !== undefined) {
        if (type === "rating" && typeof value === "number") {
            data.ratingCount = (data.ratingCount || 0) + 1
            data.ratingSum = (data.ratingSum || 0) + value
            data.total += 1
        } else {
            data[type] += 1;
            data.total += 1;
        }
    }
    await setDoc(userInteractionRef, data);
}