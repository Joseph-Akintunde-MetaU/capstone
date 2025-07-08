import { useEffect,useState } from "react"
import { getMealPlans } from "../utility/getmealplanner"
export function MealPlannerPage(){
    const [mealPlans, setMealPlans] = useState([])
    useEffect(() => {
        getMealPlans(setMealPlans)
    },[]) 
    return(
        <div>
            <h2>MY WEEKLY MEAL PLANNER</h2>
        </div>
    )
}