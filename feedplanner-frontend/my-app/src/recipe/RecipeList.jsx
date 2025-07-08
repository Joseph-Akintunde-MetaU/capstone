import { RecipeCard } from "./RecipeCard"
export function RecipeList({recipes}){
    return( recipes.map((recipe) => (
            <RecipeCard key = {recipe.id} id = {recipe.id} title = {recipe.title} image = {recipe.image} duration = {recipe.likes} />
        ))
    )
}