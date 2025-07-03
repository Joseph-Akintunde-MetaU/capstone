/* eslint-disable no-unused-vars */
import { useState } from "react"
import { auth } from "../config/firebase.config"
import { onAuthStateChanged } from "firebase/auth"
import { useEffect } from "react";
export function RecipePage(){
    const [recipes, setRecipes] = useState ([]);
    const apiKey = `09acdb4877f5429e998f19def7cd5028`
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
                const fetchFromApi = await fetch (`https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${stringIngredients}`)
                const data = await fetchFromApi.json()
                setRecipes(data)
                console.log(data)
                }else{
                    console.log("user not logged in")
                }
        }catch(error){
            console.error(error.message)
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
        </div>
    )
}