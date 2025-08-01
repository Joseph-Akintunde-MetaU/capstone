import { useEffect, useState } from "react"
import { auth } from "../config/firebase.config"
import { onAuthStateChanged } from "firebase/auth"
import {AllPantry} from "./AllPantry"
import "./PantryManager.css"
import { CreatePantryItem } from "./CreatePantryItem"
export function PantryManager({pantry, setPantry}){
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
    return (
    <div className="pantry-container">
      <div className="pantry-header">
        <div className="header-content">
          <div className="title-section">
            <h2 className="pantry-title">My Pantry</h2>
            <p className="pantry-subtitle">Manage your pantry inventory efficiently</p>
          </div>
          <button className="add-button" onClick={() => setOpenModal(true)}>
            <span className="add-icon">+</span>
            Add Item
          </button>
        </div>
      </div>

      <div className="pantry-content">
        <div className="pantry-grid">
          <AllPantry pantry={pantry} getPantry={getPantry} />
        </div>

        {openModal && <CreatePantryItem closeModal={setOpenModal} getPantry={getPantry} />}
      </div>
    </div>
  )
}
