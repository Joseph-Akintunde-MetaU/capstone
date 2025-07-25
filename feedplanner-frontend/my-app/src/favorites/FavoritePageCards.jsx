export function FavoritePageCards({id, image, title, ingredients}){
    return(
        <div>
            <img src={image} alt={title} />
            <p>{title}</p>
            <p>{ingredients}</p>
        </div>
    )
}