import { PantryCard } from "./PantryCard"
export function PantryList({pantry, getPantry}){
    function pantryUtil(pantryData){
    return(
        pantryData.map((data) => ({
            id: data.id,
            name: data.name,
            quantity: data.quantity,
            unit: data.unit
        }))
        )
    }
    const pantries = pantryUtil(pantry)
    return(
    pantries.map((pantry) => {
        return(
            <PantryCard id = {pantry.id} name = {pantry.name} quantity = {pantry.quantity} unit = {pantry.unit} getPantry={getPantry}/>
        )
    })
)
}