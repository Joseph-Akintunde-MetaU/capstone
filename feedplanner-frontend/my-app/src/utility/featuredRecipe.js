export function featuredRecipe(dataObject){
    return(
    dataObject.map((data) => ({
        id: data.id,
        image: data.image,
        title: data.title,
        duration: data.readyInMinutes
    }))
   )
}