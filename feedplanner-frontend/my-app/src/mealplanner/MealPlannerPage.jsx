import { useEffect,useState } from "react"
import "./MealPlanner.css"
import { getMealPlans } from "../utility/getmealplanner"
export function MealPlannerPage(){
    const [mealPlans, setMealPlans] = useState([])
    const [groupedData, setGroupedData] = useState({})
    useEffect(() => {
        getMealPlans(setMealPlans,setGroupedData)
    },[]) 
    const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    return(
        <div className="mealplanner">
            <h2>MY WEEKLY MEAL PLANNER</h2>
            <div className="meal-planner-grid">
                {weekDays.map((day) => (
                    <div key={day} className="day-column">
                        <h3>{day}</h3>
                        {groupedData[day] ? (
                            Object.entries(groupedData[day]).map(([mealType, recipes]) =>(
                                <div key={mealType} className="meal-group">
                                    <div className="meal-type">{mealType}</div>
                                    {recipes.map((recipe) => (
                                        <div key={recipe.recipeId} className="recipe-name">
                                            {recipe.recipeName}
                                        </div>
                                    ))}
                                </div>
                            ))
                        ): (
                            <p>no meal</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}