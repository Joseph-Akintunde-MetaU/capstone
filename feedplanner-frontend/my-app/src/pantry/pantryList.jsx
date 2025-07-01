import { pantryUtil } from "../utility/pantryUtil"
import { PantryCard } from "./PantryCard"
export function PantryList({pantry, getPantry}){
    const pantries = pantryUtil(pantry)
    return(
    pantries.map((pantry, index) => {
        return(
            <PantryCard key = {index} id = {pantry.id} name = {pantry.name} quantity = {pantry.quantity} unit = {pantry.unit} getPantry={getPantry}/>
        )
    })
)
}