import { useEffect, useState } from "react"
import { auth } from "../config/firebase.config"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
export default function AddToMealPlan({closeModal, selectedRecipeId, selectedRecipeName, getMealPlans}){
    const [selectedDay, setSelectedDay] = useState('')
    const [selectedMealType, setSelectedMealType] = useState('')
    const nav = useNavigate()
    function getDateOfSelectedWeekday(WeekStart, day){
        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
        const weekStartDate = new Date(WeekStart)
        const targetDayIndex = days.indexOf(day)
        const date = new Date(weekStartDate)
        date.setDate(weekStartDate.getDate() + targetDayIndex + 1)
        date.setHours(0,0,0,0)
        return date
    }
    async function handleAlertingForExpiredItemsBeforeMealPlanning(weekOf, selectedDay){
        const user = auth.currentUser
        const token = await user.getIdToken()
        const mealDate = getDateOfSelectedWeekday(weekOf, selectedDay)
        if(user){
            const response = await fetch ('http://localhost:5001/feedplanner/us-central1/api/pantry/' , {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "content-type": "application/json"
                }
            })
            const pantryData = await response.json()
            const pantryIngredientsResponse = await fetch ('http://localhost:5001/feedplanner/us-central1/api/pantry/ingredients', {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "content-type": "application/json"
                }
            })
            const ingredients = await pantryIngredientsResponse.json()
            const stringIngredients = ingredients.Ingredients.split(",+").map((i)=> i.trim().toLowerCase())
            const expiredIngredients = stringIngredients.filter((ingredient) => {
                const match = pantryData.find((item) => item.name == ingredient && new Date(item.expiryDate) <= mealDate)
                return match
            })
            if (expiredIngredients.length > 0) {
                toast.warn(`${expiredIngredients.length == 1 ? "This ingredient" : "These ingredients"} may expire before ${mealDate.toDateString()}: ${expiredIngredients.join(", ")}`);
            }
            return expiredIngredients
        }
    }
    async function AddMealPlan(e) {
        e.preventDefault()
        const today = new Date() 
        const day = today.getDay()
        const diff = today.getDate() - day
        const startOfWeek =new Date(today.getFullYear(), today.getMonth(), diff)
        startOfWeek.setHours(0,0,0,0)
        const weekOf = startOfWeek.toISOString().split("T")[0]
        const warnForExpiredIngredients = await handleAlertingForExpiredItemsBeforeMealPlanning(weekOf, selectedDay)
        const user = auth.currentUser;
        const token = await user.getIdToken()
                if(user){
                    try{
                        const ingredientsResponse = await fetch (`https://api.spoonacular.com/recipes/${selectedRecipeId}/ingredientWidget.json?apiKey=99ef92bd289d40adad70faaf03409ec2`)
                        const ingredientData = await ingredientsResponse.json()
                        const ingredients = ingredientData.ingredients.map((ingredient) => ingredient.name.toLowerCase())
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
                                weekOf: weekOf,
                                ingredients: ingredients
                            })
                        })
                        if(response.status === 409){
                            alert("You have already added a recipe for this slot")
                            return;
                        }
                        if(!response.ok){
                            alert("something went wrong")
                            return;
                        }
                        const data = await response.json()
                        getMealPlans()
                        closeModal(false)
                        nav("/mealPlanner")
                    }catch(error){
                        console.log(error);
                }
        }
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
                <button type="submit">ADD</button>
                <button onClick={() => closeModal(false)}>CLOSE</button>
        </form>
        </div>  
    )
}