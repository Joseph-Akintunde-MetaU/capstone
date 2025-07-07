export function RecipeList({recipes}){
    return recipes.map((recipe) => {
        <RecipeCards id = {recipe.id} image = {recipe.image} title = {recipe.title} duration = {recipe.readyInMinutes}/>
    })
}