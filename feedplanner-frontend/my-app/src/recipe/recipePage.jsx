/* eslint-disable no-unused-vars */
import { RecipeList } from "./RecipeList";
import { useState } from "react"
import { auth } from "../config/firebase.config"
import { onAuthStateChanged } from "firebase/auth"
import CircularProgress from '@mui/material/CircularProgress';
import { useEffect } from "react";
export function RecipePage(){
    const [loading, setLoading] = useState(true)
    const [recipes, setRecipes] = useState ([]);
    const apiKey = `99ef92bd289d40adad70faaf03409ec2`
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
                const stringIngredients = JSON.stringify(ingredients)
                const fetchFromApi = await fetch (`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${stringIngredients}&number=100`)
                const data = await fetchFromApi.json()
                setRecipes(data)
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
        <div>
            <h1>RECIPE</h1>
            {loading ? (<div className='loader'><CircularProgress color = "success"/> <br />Loading..</div>) : 
            <div><RecipeList recipes={recipes}/></div>}
        </div>
    )
}