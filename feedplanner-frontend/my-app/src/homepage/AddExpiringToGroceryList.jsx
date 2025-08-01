import { useState,useEffect } from "react";
import { auth } from "../config/firebase.config";
import { collection,query,orderBy,getDocs, doc,getDoc} from "firebase/firestore";
import { db } from "../config/firebase.config";

export default function AddExpiringToGroceryList({openDrawer, setOpenDrawer}){
    const [expiredIngredients, setExpiredIngredients] = useState([])
    const user = auth.currentUser; 
    async function addToGroceryList(ingredients, userId){
        for(const item of ingredients){
            if(item.expiredIngredient){
                continue;
            }
            await addDoc(collection(db, "users", userId, "groceryList"), {
                name: item.expiredIngredient,
                addedAt: new Date()
            })
        }
    }
    useEffect(() => {
        async function fetchPreferenceAndExpired (){
            if (!user) return;
            const prefDoc = await getDoc(doc(db, "users", user.uid, "preferences", "settings"))
            const autoAdd = prefDoc.exists() ? prefDoc.data().autoAddToCart : false

            const getEarliestToLatestNotifications = query(
                collection(db, "users", user.uid, "notifications"),
                orderBy("createdAt", "desc")
            );
            const getNotifications = await getDocs(getEarliestToLatestNotifications);
            const expiredNotificationData = getNotifications.docs
                .map((doc) => ({
                    id: doc.id,
                    ...doc.data()
                }))
                .filter((notif) => notif.type === "expired");
                setExpiredIngredients(expiredNotificationData)

            if(autoAdd && expiredNotificationData.length < 0){
                await addToGroceryList(expiredNotificationData, user.uid)
            }
        }
        
        fetchPreferenceAndExpired();
    }, [user]);

    return (
        <div>
            {openDrawer && <div className="drawer-overlay" onClick={() => setOpenDrawer(false)}></div>}
            <div className={`notif-drawer ${openDrawer ? "open" : ""}`}>
                <div className="notif-header">
                    <h3>Grocery List</h3>
                    <button onClick={() => setOpenDrawer(false)}>
                        Close
                    </button>
                </div>
                {expiredIngredients.length === 0 ? (
                    <p className="empty-state">Good! No expired ingredients.</p>
                ) : (
                    <ul>
                        {expiredIngredients.map((item) => (
                            <li key={item.id}>{item.expiredIngredient || "Unknown ingredient"}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}