import { useEffect, useState } from "react";
import { auth } from "../config/firebase.config";
import {toast} from 'react-toastify'
import { MdClose } from "react-icons/md";
import { db } from "../config/firebase.config";
import "./NotificationCenter.css"
import { ViewAffectedModal } from "./ViewAffectedModal";
import { deleteDoc, getDocs, query, collection, orderBy, doc, updateDoc, addDoc } from "firebase/firestore";
export default function NotificationCenter({openDrawer, setOpenDrawer, notifications, setNotifications}){
    const [openModal, setOpenModal] = useState(false)
    const [selectedNotification, setSelectedNotification] = useState(null)
    const [addToCartButton, setAddToCartButton] = useState(false)
    const user = auth.currentUser; 
    useEffect(() => {
        if (!user) return;
        async function fetchNotification() {
            const getEarliestToLatestNotifications = query(
                collection(db, "users", user.uid, "notifications"),
                orderBy("createdAt", "desc")
            );
            const getNotifications = await getDocs(getEarliestToLatestNotifications);
            const notificationData = getNotifications.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            // Show toast only for notifications that are new and unread since last fetch
            const newUnreadNotifications = notificationData.filter(
                (notif) => !notif.read
            );
            // Avoid duplicate toasts by keeping track of shown notification IDs
            const shownNotis = new Set();
            newUnreadNotifications.forEach((notif) => {
                if (!shownNotis.has(notif.id)) {
                    toast.info(`${notif.message}`);
                    shownNotis.add(notif.id);
                }
            });
            setNotifications(notificationData);
        }
        fetchNotification();
    }, [user]);
    
    async function deleteNotification(id){
        await deleteDoc(doc(db, "users", user.uid, "notifications", id));
        setNotifications(notifications.filter(notification => notification.id !== id));
    }
    async function markAsRead(id) {
        await updateDoc(doc(db, "users", user.uid, "notifications", id), {
            read: true
        })
        const getEarliestToLatestNotifications = query(
            collection(db, "users", user.uid, "notifications"), 
            orderBy("createdAt", "desc")
        );
        const getNotifications = await getDocs(getEarliestToLatestNotifications);
        const notificationData = getNotifications.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        setNotifications(notificationData);
    }
    async function handleAddToCart(notification) {
        try{
            await addDoc(collection(db, "users", user.uid, "groceryList"), {
                name: notification.expiredIngredient,
                addedAt: new Date(),
                source: "notification"
            })
            const notiRef = doc(db, "users", user.uid, "notifications", notification.id)
            await updateDoc(notiRef, {addedToCart: true})
            setAddToCartButton(true)
            toast.success(`${notification.expiredIngredient} added to cart`)
        }catch(error){
            toast.error("Failed to Add to Cart")
        }
    }
    return(
        <div>
            {openDrawer && <div className="drawer-overlay" onClick={() => setOpenDrawer(false)}></div>}
            <div className = {`notif-drawer ${openDrawer ? "open" : ""}`}>
                <div className="notif-header">
                    <h3>Notifications</h3>
                    <button onClick={() => setOpenDrawer(false)}>
                        <MdClose/>
                    </button>
                </div>
                {notifications.length === 0 ? (
                    <p className="empty-state">No Notifications</p>
                ):(
                    notifications.map((notification) => (
                        <div 
                            key={notification.id} 
                            className = {`notif-item ${notification.read ? "read" : "unread"}`}
                        >
                            <p>
                                {notification.message
                                    ?? (notification.type === 'expired'
                                        ? `${notification.expiredIngredient} has expired` 
                                        : `${notification.expiredIngredient} is expiring soon`
                                    )
                                }
                            </p>
                            <div className="notif-acions">
                                {!notification.read && <button onClick = {() => markAsRead(notification.id)}>DISMISS</button>}
                                <button onClick={() => deleteNotification(notification.id)}>DELETE</button>
                                {notification.expiredIngredient && notification.affectedRecipes.length > 0 && (
                                    <button onClick={() => {
                                        setOpenModal(true)
                                        setSelectedNotification(notification)
                                    }}>
                                        AFFECTED RECIPES
                                    </button>
                                )} 
                                {!notification.addedToCart && !addToCartButton && <button onClick={() => handleAddToCart(notification)}>ADD TO YOUR CART</button>}                
                            </div>
                        </div>
                    ))
                )}
                {openModal && selectedNotification && (
                    <ViewAffectedModal 
                        notification={selectedNotification} 
                        onClose={() => {
                            setOpenModal(false)
                            setSelectedNotification(null)
                        }}
                    />
                )}
            </div>
        </div>
    )
}