import { MdOutlineDelete } from "react-icons/md";
import "./PantryCard.css"
import { auth } from "../config/firebase.config"
import { onAuthStateChanged } from "firebase/auth"
export function PantryCard({id, name, quantity, unit, expiryDate, getPantry}){
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
     if(!expiryDate || isNaN(Date.parse(expiryDate))){
        throw new Error('Invalid Expiry Date')
    }
    const daysLeft = (new Date(`${expiryDate}T23:59:59`) - new Date())
    const isExpired = daysLeft < 0;
    const millisecondsInADay = 1000*60*60*24
    const absoluteDaysLeft = Math.abs(daysLeft)
    const days = Math.floor((absoluteDaysLeft)/(millisecondsInADay))
    const hours = Math.floor((absoluteDaysLeft % (millisecondsInADay))/(1000*60*60))
    const minutes = Math.floor((absoluteDaysLeft % (millisecondsInADay))/(1000*60))
    let color = ''
    if( days > 5){
        color = 'green'
    }else if(days > 1){
        color = 'orange'
    }else{
        color = 'red'
    }

    return(
        <div className="pantryCard" style={{border: `2px solid ${color}`}}>
            <h3>{name}</h3>
            <p>{quantity}</p>
            <p>{unit}</p>
            <p style={{color}}>
                {isExpired ? `Expired ${days > 0 ? `${days}d and `: ""} ${hours}h ago` : `Expires in ${days > 0 ? `${days}d ` : ""} ${hours}h ${minutes}m`}</p>
            <button onClick={deletePantry}><MdOutlineDelete/></button>
        </div>
    )
}