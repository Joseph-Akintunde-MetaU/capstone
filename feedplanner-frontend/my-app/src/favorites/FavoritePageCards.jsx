import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db, auth} from "../config/firebase.config";
import "./FavoriteRecipeCard.css";
export function FavoritePageCards({id, image, title, ingredients}){
    const [pantry, setPantry] = useState([]);
    const user = auth.currentUser

    useEffect(() => {
        async function fetchPantry() {
            if (!user?.uid) return;
            const pantryRef = collection(db, "users", user.uid, "pantry");
            const snapshot = await getDocs(pantryRef);
            const pantryItems = snapshot.docs.map(doc => doc.data().name?.toLowerCase().trim());
            setPantry(pantryItems.filter(Boolean));
        }
        fetchPantry();
    }, [user]);
    const normalizedIngredients = (ingredients ? ingredients.split(",") : [])
        .map(ing => ing.trim().toLowerCase())
        .filter(Boolean);

    const haveIngredients = normalizedIngredients.filter(ing => pantry.includes(ing));
    const dontHaveIngredients = normalizedIngredients.filter(ing => !pantry.includes(ing));

    return (
        <div>
            <div className="recipeCard">
                <div className="recipe-image-wrapper">
                    <img 
                        src={image} 
                        alt={title}
                        className="recipe-image"
                    />
                </div>
                <div className="recipe-content">
                    <h2>{title}</h2>
                    <div className="ingredients-section">
                        <div className="ingredients-list">
                            <h4>Ingredients you have:</h4>
                            {haveIngredients.length > 0 ? (
                                <ul>
                                    {haveIngredients.map((ing, idx) => (
                                        <li key={`have-${idx}`}>{ing}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span>None</span>
                            )}
                        </div>
                        <div className="ingredients-list">
                            <h4>Ingredients you don't have:</h4>
                            {dontHaveIngredients.length > 0 ? (
                                <ul>
                                    {dontHaveIngredients.map((ing, idx) => (
                                        <li key={`dont-have-${idx}`}>{ing}</li>
                                    ))}
                                </ul>
                            ) : (
                                <span>None</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}