import AddToMealPlan from "./AddToMealPlan"
import "./RecipeCard.css"
import { getMealPlans } from "../utility/getmealplanner"
import {FaStar} from "react-icons/fa"
import { auth } from "../config/firebase.config"
import { useState,useEffect } from "react"
import { ToastContainer } from "react-toastify"
export function RecipeCard({id, image, name,score,ingredients}){
    const [openModal, setOpenModal] = useState(false)
    const [rating, setRating] = useState(null)
    const [hover, setHover] = useState(null)
    const bookmarked = `bookmarked: ${id}`
    const [bookmarkedRecipe, setBookmarkedRecipe] = useState(false)

    useEffect(() => {
        const storedBookmark = localStorage.getItem(bookmarked);
        if (storedBookmark === "true") {
            setBookmarkedRecipe(true);
        }
    }, []);

    async function bookMarkingToggle(e){
        e.stopPropagation()
        try{
            const token = await auth.currentUser.getIdToken()
            const nextBookmarkedState = !bookmarkedRecipe;
            await fetch("http://localhost:5001/feedplanner/us-central1/api/favorites", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    recipeId: id,
                    recipeName: name,
                    imageUrl: image,
                    isFavorited: nextBookmarkedState,
                    ingredients: Array.isArray(ingredients) ? ingredients : ingredients.split(",").map(i => i.trim())
                }),
            });
            setBookmarkedRecipe(nextBookmarkedState)
            localStorage.setItem(bookmarked, nextBookmarkedState.toString())
        }catch(error){
            throw new Error(error)
        }
    }
    return(
        <div>
            <div className="recipeCard">
                <div className="card-inner">
                    <div className="front-recipe-card">
                        <img src={image} alt={name}></img>
                        <p>{name}</p>
                        <p>{score}</p>
                        <p>Ingredients used: {ingredients}</p>
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
             <ToastContainer position='top-right' autoClose = {5000} closeOnClick pauseOnHover draggable hideProgressBar = {false} theme = "light"/>
        </div>
    )
}