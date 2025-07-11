import AddToMealPlan from "./AddToMealPlan"
import "./RecipeCard.css"
import { getMealPlans } from "../utility/getmealplanner"
import { useEffect, useState } from "react"
export function RecipeCard({id, image, title, duration, ingredients}){
    const [openModal, setOpenModal] = useState(false)
     return(
        <div>
            <div className="recipeCard">
                <div className="card-inner">
                    <div className="front-recipe-card">
                        <img src={image} alt={title}></img>
                        <p>{title}</p>
                        <button onClick={(e) => {
                        e.stopPropagation();
                        setOpenModal(true)
                    }}
                    >ADD TO MEAL PLANNER</button>
                    </div>
                        <div className="back-recipe-card">
                        <p>{title}</p>
                        <p>{duration > 1 ? (`${duration} minutes`) : (`${duration} minute`)} to cook</p>
                        <ul>
                            {ingredients.map((ingredient) => {
                                <li>{ingredient}</li>
                            })}
                        </ul>
                    </div>  
                </div>
            </div>
            {openModal && <AddToMealPlan closeModal={setOpenModal} selectedRecipeId={id} selectedRecipeName={title} getMealPlans={getMealPlans}/>}  
        </div>
    )
}