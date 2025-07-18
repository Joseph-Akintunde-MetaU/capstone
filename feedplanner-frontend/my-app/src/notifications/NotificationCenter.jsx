import { useEffect, useState } from "react";
import { auth } from "../config/firebase.config";
import {toast} from 'react-toastify'
import { MdClose } from "react-icons/md";
import { db } from "../config/firebase.config";
import "./NotificationCenter.css"
import { deleteDoc, getDocs, query, collection, orderBy, doc, updateDoc } from "firebase/firestore";

export default function NotificationCenter({openDrawer, setOpenDrawer, notifications, setNotifications}){
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
                toast.info(<div><img src="https://img.icons8.com/?size=100&id=0jVKJX19V7Pe&format=png&color=000000" alt={latest.message} /> <span>{latest.message}</span></div>)
            }
            setNotifications(notificationData)
        }
        fetchNotification()
    }, [user])
    
    async function deleteNotification(id){
        await deleteDoc(doc(db, "users", user.uid, "notifications", id))
    }
    async function markAsRead(id) {
        await updateDoc(doc(db, "users", user.uid, "notifications", id), {
            read: true
        })
        fetchNotification()
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
                            </div>
                        </div>
                    ))
                )
            }
            </div>
        </div>
    )
}