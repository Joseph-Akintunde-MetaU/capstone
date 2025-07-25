import { useEffect, useState } from "react"
import { auth } from "../config/firebase.config"
import { onAuthStateChanged } from "firebase/auth"
import {AllPantry} from "./AllPantry"
import { CreatePantryItem } from "./CreatePantryItem"
export function PantryManager(){
    const [pantry, setPantry] = useState([])
    const [openModal, setOpenModal] = useState(false)
    async function getPantry(){
        onAuthStateChanged(auth, async(user) => {
            if(user){
                const token = await user.getIdToken()
                const response = await fetch(`http://localhost:5001/feedplanner/us-central1/api/pantry/` ,{
                method: "GET",
                headers:{
                    Authorization: `Bearer ${token}`,
                    'content-type': 'application/json'
                }
            })
                const data = await response.json()
                setPantry(data)
            }
        })
    }
    useEffect(() => {
        getPantry()
    },[])
    return(
        <div style={{padding: "5em"}}>
            <h2>PANTRY</h2>
            <button style={{margin: 4}} onClick={() => setOpenModal(true)}>ADD</button>
            <div>
                <AllPantry pantry={pantry} getPantry={getPantry}/>
                {openModal && <CreatePantryItem closeModal={setOpenModal} getPantry={getPantry}/>}
            </div>
        </div>
        )
}