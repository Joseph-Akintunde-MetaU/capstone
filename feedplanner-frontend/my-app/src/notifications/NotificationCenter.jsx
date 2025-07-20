import { useEffect, useState } from "react";
import { auth } from "../config/firebase.config";
import {toast} from 'react-toastify'
import { MdClose } from "react-icons/md";
import { db } from "../config/firebase.config";
import "./NotificationCenter.css"
import { ViewAffectedModal } from "./ViewAffectedModal";
import { deleteDoc, getDocs, query, collection, orderBy, doc, updateDoc } from "firebase/firestore";
export default function NotificationCenter({openDrawer, setOpenDrawer, notifications, setNotifications}){
    const [openModal, setOpenModal] = useState(false)
    const [selectedIngredient, setSelectedIngredient] = useState(null)
    const user = auth.currentUser; 
    useEffect(() => {
        if(!user) return;
        async function fetchNotification(){
            const getEarliestToLatestNotifications = query(
                collection(db, "users", user.uid, "notifications"), 
                orderBy("createdAt", "desc")
            )
            const getNotifications = await getDocs(getEarliestToLatestNotifications)
            const notificationData = getNotifications.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }))
            const latest = notificationData[0]
            const wasNew = !notifications.find((notification) => notification.id
        === latest?.id)
            if(wasNew && latest && !latest.read){
                toast.info(`${latest.message}`)
            }
            setNotifications(notificationData)
        }
        fetchNotification()
    }, [user])
    
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
                        <div key={notification.id} className = {`notif-item ${notification.read ? "read" : "unread"}`}>
                            <p>{notification.message}</p>
                            <div className="notif-acions">
                                {!notification.read && <button onClick = {() => markAsRead(notification.id)}>DISMISS</button>}
                                <button onClick={() => deleteNotification(notification.id)}>DELETE</button>
                                {notification.expiredIngredient && (
                                    <button onClick={() => {
                                        setOpenModal(true)
                                        setSelectedIngredient(notification.expiredIngredient)
                                    }}>
                                        AFFECTED RECIPES
                                    </button>
                                )} 
                            </div>
                        </div>
                    ))
                )}
                {openModal && selectedIngredient && (
                    <ViewAffectedModal 
                        ingredient={selectedIngredient} 
                        onClose={() => {
                            setOpenModal(false)
                            setSelectedIngredient(null)
                        }}
                    />
                )}
            </div>
        </div>
    )
}