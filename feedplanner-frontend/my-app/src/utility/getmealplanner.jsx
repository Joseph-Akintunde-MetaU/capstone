import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../config/firebase.config"
import { useState } from "react"
export async function getMealPlans(setMealPlans,customWeekOf = null) {
        const getMeals = onAuthStateChanged(auth, async(user) => {
            try{
                if(user){
                    const token = await user.getIdToken()
                    const today = new Date() 
                    const startOfWeek = new Date(today)
                    startOfWeek.setDate(today.getDate() - today.getDay())
                    const weekOf = customWeekOf || startOfWeek.toISOString().split("T")[0]
                    const response = await fetch(`http://localhost:5001/feedplanner/us-central1/api/mealPlanner?weekOf=${weekOf}` ,{
                    method: "GET",
                    headers:{
                        Authorization: `Bearer ${token}`,
                        'content-type': 'application/json'
                    },
                })
                const data = await response.json();
                setMealPlans(data)
            }
            }catch(error){
                console.error(error)
            }
    })
    }