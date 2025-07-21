import { useEffect, useState } from "react"
import CircularProgress from '@mui/material/CircularProgress';
import { GetBookmarks } from "../utility/getBookmarks";
import  FavoritePageList  from "./FavoritesPageList";
export function FavoritePage({scoredRecipes}){
    const [bookmarkedData, setBookmarkedData] = useState([])
    const apiKey = process.env.REACT_APP_API_KEY
    const [loading, setLoading] = useState(true)
    const [bookmarkedRecipeCards, setBookmarkedRecipeCards] = useState([])
    useEffect(() => {
         GetBookmarks(setBookmarkedData, setLoading)
    },[]) 
    async function getBookmarkedRecipes(){
        try{
            
            const fetches = bookmarkedData.map(async(id) => {
                const response = await fetch (`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`)
                const data = await response.json()
                return data
            })
            const results = await Promise.all(fetches)
            setBookmarkedRecipeCards(results)
        }catch(error){
            console.error(error)
        }finally{
            setLoading(false)
        }
    }
    useEffect(() => {
        getBookmarkedRecipes()
    },[bookmarkedData])
    return(
        <div style = {{padding: "4rem"}}className="favorites-list">
            <h1>FAVORITES</h1>
            {loading ? (<div className='loader'><CircularProgress color = "success"/> <br />Loading..</div>) : 
            <FavoritePageList recipes={bookmarkedRecipeCards}/>}
        </div>
    )
}