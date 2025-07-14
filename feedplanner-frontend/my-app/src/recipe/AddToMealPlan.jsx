import { useEffect, useState } from "react"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../config/firebase.config"
import { useNavigate } from "react-router-dom"
export default function AddToMealPlan({closeModal, selectedRecipeId, selectedRecipeName, getMealPlans}){
    const [selectedDay, setSelectedDay] = useState('')
    const [selectedMealType, setSelectedMealType] = useState('')
    const nav = useNavigate()
    async function AddMealPlan() {
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        const weekOf = startOfWeek.toISOString().split("T")[0]
        onAuthStateChanged(auth, async(user) => {
            try{
                const token = await user.getIdToken()
                if(user){
                    const response = await fetch(`http://localhost:5001/feedplanner/us-central1/api/mealPlanner/` ,{
                        method: "POST",
                        headers:{
                            Authorization: `Bearer ${token}`,
                            'content-type': 'application/json'
                        },
                        body: JSON.stringify({
                            recipeName: selectedRecipeName,
                            recipeId: selectedRecipeId,
                            dayOfTheWeek: selectedDay,
                            mealType: selectedMealType,
                            weekOf: weekOf
                        })
                    })
                    nav("/mealPlanner")
                    getMealPlans()
                    const data = await response.json()
                    closeModal(false)
                }else{
                    throw new Error()
                }  
            }catch(error){
                console.log(error);
            }
          
        })
    }
    return(
        <div>
            <form className="modalToAddPantry" onSubmit={AddMealPlan}>
                <label htmlFor="day">Day</label>
                <select name="day" id="day-of-the-week-dropdown" value = {selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
                    <option value="" disabled>Select a day</option>
                    <option value="sunday">Sunday</option>
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                </select>
                <label htmlFor="meal-type">Day</label>
                <select name="meal-type" id="meal-type-dropdown" value={selectedMealType} onChange={(e) => setSelectedMealType(e.target.value)}>
                    <option value="" disabled>Select a Meal Type</option>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                </select>
        </form>
        <button onClick={AddMealPlan}>ADD</button>
        <button onClick={() => closeModal(false)}>CLOSE</button>
        </div>  
    )
}