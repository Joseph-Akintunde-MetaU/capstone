export function pantryUtil(pantryData){
   return(
    pantryData.map((data) => ({
        id: data.id,
        name: data.name,
        quantity: data.quantity,
        unit: data.unit
    }))
   )
}