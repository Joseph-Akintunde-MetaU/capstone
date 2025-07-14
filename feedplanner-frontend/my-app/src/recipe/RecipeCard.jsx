import AddToMealPlan from "./AddToMealPlan"
import "./RecipeCard.css"
import { getMealPlans } from "../utility/getmealplanner"
import {FaStar} from "react-icons/fa"
import { auth } from "../config/firebase.config"
import { useState,useEffect } from "react"
export function RecipeCard({id, image, title, duration}){
    const [openModal, setOpenModal] = useState(false)
    const [rating, setRating] = useState(null)
    const [hover, setHover] = useState(null)
    const bookmarked = `bookmarked: ${id}`
    const [bookmarkedRecipe, setBookmarkedRecipe] = useState(false)
    async function bookMarkingToggle(e){
        e.stopPropagation()
       
        try{
            const token = await auth.currentUser.getIdToken()
            const nextBookmarkedState = !bookmarkedRecipe;
            await fetch("http://localhost:5001/feedplanner/us-central1/api/bookmark",{
                method: "POST",
                headers:{
                    Authorization: `Bearer ${token}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    recipeId: id,
                    isBookmarked: nextBookmarkedState,
                }),
            });
            setBookmarkedRecipe(nextBookmarkedState)
            localStorage.setItem('bookmarked', nextBookmarkedState.toString())
        }catch(error){
            console.error("failed to bookmark")
        }
    }
     return(
        <div>
            <div className="recipeCard">
                <div className="card-inner">
                    <div className="front-recipe-card">
                        <img src={image} alt={title}></img>
                        <p>{title}</p>
                    </div>
                        <div className="back-recipe-card">
                            <div className="ratings">
                                {[...Array(5)].map((star, i) => {
                                    const ratingNumber = i+1;
                                    return  (
                                        <label>
                                            <input type="radio" name="" id="radio" value={ratingNumber} onClick={() => setRating(ratingNumber)}/>
                                            <FaStar className = "star" color = {ratingNumber <= (hover ||rating) ? "var(--text-primary)" : "white"} size={30} onMouseEnter={() => setHover(ratingNumber)} onMouseLeave={() => setHover}/>
                                        </label>
                                    )
                                })}
                            </div>
                    <button onClick={(e) => {
                        e.stopPropagation();
                        setOpenModal(true)
                    }}
                    >ADD TO MEAL PLANNER</button> 
                    <button onClick={bookMarkingToggle}>
                       <img src={ bookmarkedRecipe ? "https://img.icons8.com/?size=100&id=26083&format=png&color=000000" : "https://img.icons8.com/?size=100&id=25157&format=png&color=000000"}/>
                    </button>
                    </div>  
                </div>
            </div>
            {openModal && <AddToMealPlan closeModal={setOpenModal} selectedRecipeId={id} selectedRecipeName={title} getMealPlans={getMealPlans}/>}  
        </div>
    )
}