import { useEffect,useState } from "react"
import "./MealPlanner.css"
import { MdOutlineDelete } from "react-icons/md"
import { getMealPlans } from "../utility/getmealplanner"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../config/firebase.config"
export function MealPlannerPage(){
    const [mealPlans, setMealPlans] = useState([])
    const [groupedData, setGroupedData] = useState({})
    async function deleteMealFromPlanner(id){
        onAuthStateChanged(auth, async(user) => {
            const token = await user.getIdToken()
            if(user){
                try{
                    const response = await fetch (`http://localhost:5001/feedplanner/us-central1/api/mealplanner/${id}`,{
                        method: 'DELETE',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'content-type': 'application/json'
                        }
                    })
                    getMealPlans(setMealPlans,setGroupedData)
                }catch(error){
                    console.error(error)
                }
            }
        })
    }
    useEffect(() => {
        getMealPlans(setMealPlans,setGroupedData)
    },[]) 
    const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const mealType = ["breakfast", "lunch", "dinner"]
    return(
        <div className="mealplanner">
            <h2>MY WEEKLY MEAL PLANNER</h2>
            <div className="meal-planner-grid">
                {weekDays.map((day) => (
                    <div key={day} className="day-column">
                        <h2>{day}</h2>
                        {groupedData[day] ? (
                            mealType.map((mealType) => {
                                const recipes = groupedData[day][mealType] || []
                                return(
                                    <div key={mealType} className="meal-group">
                                        <div className="meal-type">{mealType}</div>
                                        {recipes.length > 0 ? (
                                            recipes.map((recipe) => (
                                                <div key={recipe.recipeId} className="recipe-name">
                                                    {recipe.recipeName}
                                                    <button onClick={() => deleteMealFromPlanner(recipe.id)}><MdOutlineDelete/></button>
                                                </div>
                                            ))
                                        ) : (
                                            <p>No recipes added</p>
                                        )}
                                    </div>
                                )
                            })
                        ) : (
                            <p>no meal</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
)
}
