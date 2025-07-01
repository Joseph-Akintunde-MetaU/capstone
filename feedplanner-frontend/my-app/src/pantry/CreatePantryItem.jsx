import { useState,useEffect } from "react"
import './CreatePantryItem.css'
import { auth } from "../config/firebase.config"
import { onAuthStateChanged } from "firebase/auth"
export function CreatePantryItem({closeModal,getPantry}){
    const [name, setName] = useState('')
    const [quantity, setQuantity] = useState('')
    const [unit, setUnit] = useState('') 
    async function addPantry(){
        const unsubscribe = onAuthStateChanged(auth, async(user) => {
            if(user){
                const token = await user.getIdToken()
                const response = await fetch(`http://localhost:5004/feedplanner/us-central1/api/pantry/` ,{
                method: "POST",
                headers:{
                    Authorization: `Bearer ${token}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    quantity: quantity,
                    unit: unit
                })
            })
                const data = await response.json()
                getPantry()
            }else{
                console.log("user not logged in")
            }
        })
        return unsubscribe
    }
    return(
        <div className="modal">
            <form action="" className="modalToAddPantry">
                <label htmlFor="name">Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}/>
                <label htmlFor="quantity">Quantity</label>
                <input type="text" value={quantity} onChange={(e) => setQuantity(e.target.value)}/>
                <label htmlFor="unit">Unit</label>
                <input type="text" value={unit} onChange = {(e) => setUnit(e.target.value)}/>
                 <button onClick={addPantry}>CREATE</button>
            </form>
            <button onClick={() => closeModal(false)}>CLOSE</button>
        </div>
    )
}