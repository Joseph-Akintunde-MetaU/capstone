import { MdOutlineDelete } from "react-icons/md";
import "./PantryCard.css"
import { auth } from "../config/firebase.config"
import { onAuthStateChanged } from "firebase/auth"
export function PantryCard({id, name, quantity, unit, getPantry}){
    async function deletePantry(){
        const deleteValid = onAuthStateChanged(auth, async(user) => {
            if(user){
                const token = await user.getIdToken()
                const response = await fetch(`http://localhost:5004/feedplanner/us-central1/api/pantry/${id}` ,{
                method: "DELETE",
                headers:{
                    Authorization: `Bearer ${token}`,
                    'content-type': 'application/json'
                }
            })
            getPantry()
            }else{
                console.log("user not logged in")
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