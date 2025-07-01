import { featuredRecipe } from "../utility/featuredRecipe";
import { FeaturedRecipeCard } from "./featuredRecipeCard";
export function FeaturedRecipeList({featuredRecipes, HomePageRecipes}){
    const recipeList = featuredRecipe(featuredRecipes)
    return(
        <div>
            {
                recipeList.map((recipe) => {
                    return(
                        <FeaturedRecipeCard image = {recipe.image} title = {recipe.title} duration = {recipe.duration} HomePageRecipes = {HomePageRecipes}/>
                    )
                })
            }
        </div>
    )
}