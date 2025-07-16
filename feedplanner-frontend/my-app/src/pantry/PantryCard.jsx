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
    const daysLeft = Math.ceil(
        (new Date(expiryDate) - new Date())/(1000*60*60*24)
    )
    let color = ''
    if( daysLeft > 5){
        color = 'green'
    }else if(daysLeft > 2){
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
                {daysLeft > 0 ? `Expires in ${daysLeft} day${daysLeft > 1 ? "s" : ""}` : "Expired"}</p>
            <button onClick={deletePantry}><MdOutlineDelete/></button>
        </div>
    )
}