/* eslint-disable no-unused-vars */
import { RecipeList } from "./RecipeList";
import "./recipePage.css"
import { useState } from "react"
import { auth } from "../config/firebase.config"
import { onAuthStateChanged } from "firebase/auth"
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect } from "react";
export function RecipePage({recipes, setRecipes}){
    const [loading, setLoading] = useState(true)
    const [recipeIngredients,  setRecipeIngredients] = useState({})
    const apiKey = process.env.REACT_APP_API_KEY
        async function getRecipes(){
        const fetchMatchingRecipe = onAuthStateChanged(auth, async(user) => {
            try{
                if(user){
                    const token = await user.getIdToken()
                    const response = await fetch(`http://localhost:5001/feedplanner/us-central1/api/pantry/ingredients` ,{
                    method: "GET",
                    headers:{
                        Authorization: `Bearer ${token}`,
                        'content-type': 'application/json'
                    }
                })
                const ingredients = await response.json()
                const stringIngredients = ingredients.Ingredients
                const fetchFromApi = await fetch (`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${stringIngredients}&number=4`)
                const data = await fetchFromApi.json()
                setRecipes(data)
                const recipeIds = data.map(recipe => recipe.id);
                const idresponse = await fetch(`https://api.spoonacular.com/recipes/informationBulk?apiKey=${apiKey}&ids=${recipeIds}`)
                const iddata = await idresponse.json()
                const ingredientsMap = {};
                iddata.forEach(recipe => {
                    ingredientsMap[recipe.id] = recipe.extendedIngredients.map(ing => ing.nameClean).join(", ");
                });
                setRecipeIngredients(ingredientsMap);     
                }else{
                    console.log("user not logged in")
                }
        }catch(error){
            console.error(error.message)
        }finally{
            setLoading(false)
        }
        })
        return fetchMatchingRecipe
    }
    useEffect(() => {
        getRecipes()
    }, [])
    return(
        <div className="recipePage">
            <h1>RECIPES</h1>
            <div className="recipes">
                {loading ? (<div className='loader'><CircularProgress color = "success"/> <br />Loading..</div>) : 
                <div className="recipeList"><RecipeList recipes={recipes} recipeIngredients={recipeIngredients}/></div>}
            </div>        
        </div>
    )
}