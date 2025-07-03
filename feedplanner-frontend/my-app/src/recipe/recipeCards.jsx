/* eslint-disable no-unused-vars */
export function RecipeCards({id, image, title, duration}){
    return(
        <div>
            <img src={image}/>
            <p>{title}</p>
            <p>{duration}</p>
        </div>
)
}