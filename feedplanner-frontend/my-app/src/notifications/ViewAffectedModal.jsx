import { useEffect, useState } from "react"
import { auth } from "../config/firebase.config"
import { db } from "../config/firebase.config"
import { collection, getDocs } from "firebase/firestore"
import "./ViewAffectedModal.css"
export function ViewAffectedModal({ingredient, onClose}){
    const [recipes, setRecipes] = useState([])
    const [substitutes, setSubstitutes] = useState([])
    const apiKey = `99ef92bd289d40adad70faaf03409ec2`
    const user = auth.currentUser
    const userId = user.uid
    async function fetchRecipesFromMealPlanner() {
        const reference = collection(db,"users",userId,"mealPlan")
        const getReference = await getDocs(reference)
        const MealPlannerData = getReference.docs.map((doc) => doc.data())
        const MealPlannedeRecipesWithExpiredIngredient = MealPlannerData.filter((recipe) => 
            recipe.ingredients?.some(ing => ing.toLowerCase().includes(ingredient.toLowerCase()))
        );
        setRecipes(MealPlannedeRecipesWithExpiredIngredient)
    }
    async function getSubstitutes(){
        if(user){
            try{
                const response = await fetch(`https://api.spoonacular.com/food/ingredients/substitutes?apiKey=${apiKey}&ingredientName=${encodeURIComponent(ingredient)}`);
                const data = await response.json();
                setSubstitutes(data.substitutes || [])
            }catch(error){
                console.error('failed to fetch')
            }
        }
    }
    useEffect(() => {
        fetchRecipesFromMealPlanner()
        getSubstitutes()
    }, [ingredient, userId])
    return (
        <div className="affected-modal-overlay">
            <div className="modal-box">
                <h3>Recipes using {ingredient}</h3>
                {recipes.length > 0 ? (
                    <ul>
                        {recipes.map((recipe, i) => (
                            <li key={i}>
                                {recipe.recipeName} ({recipe.dayOfTheWeek}, {recipe.mealType})
                                <div>
                                    <strong>Substitutes for {ingredient} in {recipe.recipeName}:</strong>
                                    {substitutes.length > 0 ? (
                                        <ul>
                                            {substitutes.map((s, j) => (
                                                <li key={j}>{s}</li>
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