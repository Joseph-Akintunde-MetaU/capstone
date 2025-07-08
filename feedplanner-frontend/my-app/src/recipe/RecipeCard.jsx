import AddToMealPlan from "./AddToMealPlan"
import { getMealPlans } from "../utility/getmealplanner"
import { useEffect, useState } from "react"
export function RecipeCard({id, image, title, duration}){
    const [openModal, setOpenModal] = useState(false)
     return(
        <div className="pantryCard">
            <img src={image} alt={title}></img>
            <p>{title}</p>
            <p>{duration > 1 ? (`${duration} minutes`) : (`${duration} minute`)}</p>
            <button onClick={() => setOpenModal(true)}>ADD TO MEALPLANNER</button>
            {openModal && <AddToMealPlan closeModal={setOpenModal} selectedRecipeId={id} selectedRecipeName={title} getMealPlans={getMealPlans}/>}
        </div>
    )
}