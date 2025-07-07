/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useNavigate } from 'react-router-dom'
import './HomePage.css'
import { useEffect, useState } from 'react'
import { FeaturedRecipeList } from './featuredRecipeList'
import { PantryManager } from '../pantry/PantryManager'
export function HomePage({isSignedOut}){
    const apiKey = "99ef92bd289d40adad70faaf03409ec2"
    const email = localStorage.getItem("username")
    const [featuredRecipes, setFeaturedRecipes] = useState([])
    const nav = useNavigate()
    async function HomePageRecipes(){
        try{
            const response = await fetch(`https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=3`)
            const data = await response.json()
            setFeaturedRecipes(data.recipes)
            console.log(data.recipes)
        }catch(error){
            console.error(error)
        }finally{
            setLoading(false)
        }
    }
    async function FoodTrivia(){
        try{
            const response = await fetch(`https://api.spoonacular.com/food/trivia/random?apiKey=${apiKey}`)
            const data = await response.json()
            console.log(data)
        }catch(error){
            console.error(error)
        }
    }
    useEffect(() => {
        HomePageRecipes()
        FoodTrivia()
    },[])
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
                <button onClick={() => nav("/pantry")}>PANTRY MANAGER <br/>+</button>
            </div>
            <FeaturedRecipeList featuredRecipes = {featuredRecipes} HomePageRecipes = {HomePageRecipes} />
            <PantryManager/>
        </div>
    )
}