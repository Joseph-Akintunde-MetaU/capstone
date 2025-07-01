import { useNavigate } from 'react-router-dom'
import './HomePage.css'
import { useEffect, useState } from 'react'
import { FeaturedRecipeList } from './featuredRecipeList'
export function HomePage({isSignedOut}){
    const email = localStorage.getItem("email")
    const [featuredRecipes, setFeaturedRecipes] = useState([])
    const nav = useNavigate()
    const apiKey = process.env.REACT_APP_API_KEY
    // async function HomePageRecipes(){
    //     const response = await fetch(`https://api.spoonacular.com/recipes/random?apiKey=99ef92bd289d40adad70faaf03409ec2&number=3&include-tags=vegetarian,dessert`)
    //     const data = await response.json()
    //     setFeaturedRecipes(data.recipes)
    //     console.log(data.recipes)
    // }
    // useEffect(() => {
    //     HomePageRecipes()
    // },[])
    return(
        <div>
            <div>
                <p>Welcome {email ? email : nav('/errorpage')}</p>
                <h2>DISH DISCOVERY</h2>
                <div>
                    <h3>FEATURED RECIPES OF THE DAY</h3>
                </div>
            </div>
            <div className='pantryAdder'>
                <button onClick={() => nav("/pantry")}>PANTRY MANAGER <br/>your go-to pantry handler</button>
            </div>
            <FeaturedRecipeList featuredRecipes = {featuredRecipes} />
        </div>
    )
}