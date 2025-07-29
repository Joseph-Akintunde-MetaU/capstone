import { FeaturedRecipeCard } from "./featuredRecipeCard";
export function FeaturedRecipeList({featuredRecipes, HomePageRecipes}){
    return featuredRecipes.map((recipe) => (
                <FeaturedRecipeCard key = {recipe.id} image = {recipe.image} title = {recipe.title} healthScore={recipe.healthScore} servings={recipe.servings} readyInMinutes={recipe.readyInMinutes} summary={recipe.summary} HomePageRecipes = {HomePageRecipes}/>
    ))
}