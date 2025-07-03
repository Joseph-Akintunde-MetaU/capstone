/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react"
import { auth } from "../config/firebase.config"
import { onAuthStateChanged } from "firebase/auth"
export function PantryManager(){
const [pantry, setPantry] = useState([])
useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async(user) => {
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
        }else{
            console.log("user not logged in")
        }
    })
        return () => unsubscribe()
    },[])
    return(
        <div>
            
        </div>
    )
}