import { MdOutlineDelete } from "react-icons/md";
import "./PantryCard.css"
import { auth } from "../config/firebase.config"
import { onAuthStateChanged } from "firebase/auth"
export function PantryCard({id, name, quantity, unit, getPantry}){
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
    return(
        <div className="pantryCard">
            <h3>{name}</h3>
            <p>{quantity}</p>
            <p>{unit}</p>
            <button onClick={deletePantry}><MdOutlineDelete/></button>
        </div>
    )
}