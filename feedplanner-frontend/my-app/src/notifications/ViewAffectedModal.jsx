import { useEffect, useState } from "react"
import { auth } from "../config/firebase.config"
import { db } from "../config/firebase.config"
import { collection, getDocs } from "firebase/firestore"
import "./ViewAffectedModal.css"
export function ViewAffectedModal({notification, onClose}){
    const [recipes, setRecipes] = useState([])
    const substitutes = notification.substitutes || []
    const expiredIngredient = notification.expiredIngredient
    const apiKey = process.env.REACT_APP_API_KEY
    const user = auth.currentUser
    const userId = user.uid
    async function fetchRecipesFromMealPlanner() {
        const reference = collection(db,"users",userId,"mealPlan")
        const getReference = await getDocs(reference)
        const MealPlannerData = getReference.docs.map((doc) => doc.data())
        const MealPlannedeRecipesWithExpiredIngredient = MealPlannerData.filter((recipe) => 
            Array.isArray(recipe.ingredients) &&
            recipe.ingredients.some(ing => 
            typeof ing === "string" &&
            ing.toLowerCase().includes(expiredIngredient?.toLowerCase() || "")
            )
        );
        setRecipes(MealPlannedeRecipesWithExpiredIngredient)
    }
    useEffect(() => {
        fetchRecipesFromMealPlanner()
    }, [expiredIngredient, userId])
    return (
        <div className="affected-modal-overlay">
            <div className="modal-box">
                <h3>Recipes using {expiredIngredient}</h3>
                {recipes.length > 0 ? (
                    <ul>
                        {recipes.map((recipe, i) => (
                            <li key={i}>
                                <h3><strong>{recipe.recipeName} ({recipe.dayOfTheWeek}, {recipe.mealType})</strong></h3>
                                <div>
                                    <strong>Substitutes for {expiredIngredient} in {recipe.recipeName}:</strong>
                                    {substitutes.length > 0 ? (
                                        <ul>
                                            {substitutes.map((sub, j) => (
                                                <li key={j}>{sub}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p>Oops! No substitutes found!</p>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No recipes found using this ingredient</p>
                )}
                <button onClick={onClose}>CLOSE</button>
            </div>
        </div>
    )
}