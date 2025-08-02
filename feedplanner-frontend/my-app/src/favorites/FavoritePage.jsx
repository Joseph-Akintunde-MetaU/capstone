import { useEffect, useState } from "react"
import CircularProgress from '@mui/material/CircularProgress';
import { GetBookmarks } from "../utility/getBookmarks";
import  FavoritePageList  from "./FavoritesPageList";
import "./FavoritesPage.css"
export function FavoritePage({scoredRecipes, recipeIngredients, setRecipeIngredients, favoritedRecipeCards, setFavoritedRecipeCards}){
    const [favoritedData, setFavoritedData] = useState([])
    const apiKey = process.env.REACT_APP_API_KEY
    const [loading, setLoading] = useState(true)
    useEffect(() => {
         GetBookmarks(setFavoritedData, setLoading)
    },[]) 
    async function getFavoritedRecipes(){
        try{
            
            const fetches = favoritedData.map(async(id) => {
                const response = await fetch (`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`)
                const data = await response.json()
                return data
            })
            const results = await Promise.all(fetches)
            setFavoritedRecipeCards(results)
            const ingredientsMap = {};
            results.forEach((recipe) => {
                ingredientsMap[recipe.id] = recipe.extendedIngredients
                    .map((ing) => ing.nameClean)
                    .join(", ");
            });
            setRecipeIngredients(ingredientsMap)
        }catch(error){
            console.error(error)
        }finally{
            setLoading(false)
        }
    }
    useEffect(() => {
        getFavoritedRecipes()
    },[favoritedData])
    return(
        <div style = {{padding: "4rem"}}className="favorites-list">
            <h1>FAVORITES</h1>
            {loading ? (<div className='loader'><CircularProgress color = "success"/> <br />Loading..</div>) : 
            <FavoritePageList recipes={favoritedRecipeCards} recipeIngredients = {recipeIngredients}/>}
        </div>
    )
}