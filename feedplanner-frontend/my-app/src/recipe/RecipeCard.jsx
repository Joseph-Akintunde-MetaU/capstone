export function RecipeCard({id, image, title, duration}){
     return(
        <div className="pantryCard">
            <img src={image} alt={title}></img>
            <p>{title}</p>
            <p>{duration}</p>
            <button>ADD TO MEALPLANNER</button>
        </div>
    )
}