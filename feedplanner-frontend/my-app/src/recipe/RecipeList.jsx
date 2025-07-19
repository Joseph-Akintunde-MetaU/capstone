import { RecipeCard } from "./RecipeCard"
export function RecipeList({recipes, recipeIngredients}){
    return( recipes.map((recipe) => (
            <RecipeCard key = {recipe.id} id = {recipe.id} title = {recipe.title} image = {recipe.image} likes = {recipe.likes} ingredients = {recipeIngredients[recipe.id]}/>
        ))
    )
}