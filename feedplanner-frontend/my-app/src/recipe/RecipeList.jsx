import { RecipeCard } from "./RecipeCard.jsx"

export function RecipeList({ recipes, recipeIngredients, darkMode }) {
    if (!recipes || recipes.length === 0) {
        return (
            <div className="no-recipes">
                <div className="no-recipes-content">
                    <div className="no-recipes-icon">🍳</div>
                    <h3>No recipes found</h3>
                    <p>Try adding more ingredients to your pantry or check back later!</p>
                    <button
                        className="add-ingredients-btn"
                        onClick={() => (window.location.href = "/pantry")}
                    >
                        Add Ingredients
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="recipe-grid">
            {recipes.map((recipe, index) => (
                <RecipeCard
                    key={recipe.id}
                    id={recipe.id}
                    image={recipe.image}
                    name={recipe.name}
                    score={recipe.finalScore}
                    ingredients={recipeIngredients[recipe.id] || recipe.ingredients}
                    cookTime={recipe.cookTime}
                    healthScore={recipe.healthScore}
                    instructions={recipe.instructions}
                    summary={recipe.summary}
                    cuisines={recipe.cuisines}
                    dishTypes={recipe.dishTypes}
                    servings={recipe.servings}
                    pricePerServing = {recipe.pricePerServing}
                    diets={recipe.diets}
                    animationDelay={index * 0.1}
                    recipes={recipes}
                    darkMode={darkMode}
                />
            ))}
        </div>
    )
}
