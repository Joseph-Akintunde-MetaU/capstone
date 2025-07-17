import { MdOutlineDelete } from "react-icons/md";
import "./PantryCard.css"
import { auth } from "../config/firebase.config"
import { onAuthStateChanged } from "firebase/auth"
import { MdEdit } from "react-icons/md";
import { useEffect, useState } from "react";
export function PantryCard({id, name, quantity, unit, expiryDate, getPantry}){
    const [editedName, setEditedName] = useState(name)
    const [editedExpiryDate, setEditedExpiryDate] = useState(expiryDate)
    const [isEditingExpiryDate, setIsEditingExpiryDate] = useState(false)
    useEffect(() => {
        setEditedName(name)
        setEditedExpiryDate(expiryDate)
    },[name, expiryDate])
    async function saveField(field, value) {
        const user = auth.currentUser;
        if(user){
            try{
                const token = await user.getIdToken()
                const response = await fetch(`http://localhost:5001/feedplanner/us-central1/api/pantry/${id}`, {
                    method: "PATCH",
                    headers: {
                    Authorization: `Bearer ${token}`,
                    'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                       [field]: value
                    })
                })
                getPantry()
            }catch(error){
                throw new Error(error)
            }
        }
    }
    async function deletePantry(){  
        // eslint-disable-next-line no-unused-vars
        onAuthStateChanged(auth, async(user) => {
            if(user){
                const token = await user.getIdToken()
                // eslint-disable-next-line no-unused-vars
                const response = await fetch(`http://localhost:5001/feedplanner/us-central1/api/pantry/${id}` ,{
                method: "DELETE",
                headers:{
                    Authorization: `Bearer ${token}`,
                    'content-type': 'application/json'
                }
            })
            getPantry()
            }
        })
    }
    const expiry = new Date(expiryDate);
    const now = new Date();
    // Calculate time difference and status
    const { isExpired, absoluteDifference } = calculateTimeDifference(expiry, now);

    // Break down time into readable components
    const { daysTillExpiry, hoursTillExpiry, minutesTillExpiry } = getTimeBreakdown(absoluteDifference);

    // Determine color based on days left
    const color = getColorByDaysLeft(isExpired, daysTillExpiry, hoursTillExpiry,minutesTillExpiry);

    // Construct the message
    const expiryMessage = buildExpiryMessage(isExpired, daysTillExpiry, hoursTillExpiry, minutesTillExpiry, expiry);
    function parseExpiryDate(dateString) {
    const date = new Date(dateString);
        if (isNaN(date)) {
            throw new Error('Invalid Expiry Date');
        }
        return date;
    }

    function calculateTimeDifference(expiryDate, currentDate) {
        const difference = expiryDate - currentDate;
        const isExpired = difference <= 0;
        const absoluteDifference = Math.abs(difference);
        return { isExpired, absoluteDifference };
    }

    function getTimeBreakdown(milliseconds) {
        const millisecondsInADay = 1000 * 60 * 60 * 24;
        const millisecondsInAnHour = 1000 * 60 * 60;
        const millisecondsInAMinute = 1000 * 60;
        const daysTillExpiry = Math.floor(milliseconds / millisecondsInADay);
        const hoursTillExpiry = Math.floor((milliseconds % millisecondsInADay) / millisecondsInAnHour);
        const minutesTillExpiry = Math.floor((milliseconds % millisecondsInAnHour) / millisecondsInAMinute);

        return { daysTillExpiry, hoursTillExpiry, minutesTillExpiry };
    }

    function getColorByDaysLeft(isExpired, daysTillExpiry, hoursTillExpiry, minutesTillExpiry) {
        if(isExpired){
            return 'red'
        }
        if (daysTillExpiry >= 5) {
            return 'green';
        } else if (daysTillExpiry > 1) {
            return 'orange';
        } else if (hoursTillExpiry > 4) {
            return 'coral';
        } else if (hoursTillExpiry > 1 || minutesTillExpiry > 0) {
            return 'crimson';
        }

    }

    function buildExpiryMessage(isExpired, days, hours, minutes, expiry) {
        const dayStr = days > 0 ? `${days}d ` : '';
        const hourStr = ` ${hours}h`;
        const minuteStr = ` ${minutes}m`;

        const localeString = expiry.toLocaleString(undefined, {
            weekday: 'short',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        if (isExpired) {
            return `Expired ${dayStr}${hourStr}${minuteStr} ago (on ${localeString})`;
        } else {
            return `Expires in ${dayStr}${hourStr} ${minuteStr} (at ${localeString})`;
        }
    }
    return (
        <div className="pantry-container">
            <div className="pantry-shelves">
                <div className="shelf">
                    <div className="shelf-items">
                        <div className="pantryCard">
                            <input className = "editable" value={editedName} onChange={(e) => setEditedName(e.target.value)} onBlur={() => saveField('name', editedName)} />
                            <p>{quantity}</p>
                            <p>{unit}</p>
                            {isEditingExpiryDate ? (<input type = "datetime-local" value={editedExpiryDate} onChange={(e) => setEditedExpiryDate(e.target.value)} onBlur = {async () => {
                                await saveField("expiryDate", editedExpiryDate)
                                setIsEditingExpiryDate(false);
                            }} autoFocus/>) : 
                            (<div style = {{display: "flex", alignItems: "center", gap: "0.3rem"}}>
                                <p style={{ color }}>{expiryMessage}</p>
                                <MdEdit style={{cursor: "pointer", fontSize: "3em"}} onClick={() => setIsEditingExpiryDate(true)}/>
                            </div>
                            )}
                            <button onClick={deletePantry}>
                                <MdOutlineDelete />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
