import { RecipeList } from "./RecipeList";
import "./recipePage.css";
import { useState, useEffect } from "react";
import { auth } from "../config/firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import CircularProgress from "@mui/material/CircularProgress";
import { db } from "../config/firebase.config";
import { collection, getDocs,getDoc, doc} from "firebase/firestore";
import { ScoreRecommendationForRecipes } from "../utility/scoreRecommendationForRecipes";

export function RecipePage({ recipes, setRecipes, scoredRecipes, setScoredRecipes}) {
    const [loading, setLoading] = useState(true);
    const [recipeIngredients, setRecipeIngredients] = useState({});
    const apiKey = process.env.REACT_APP_API_KEY;

    async function getRecipes(token) {
        try {
            const response = await fetch(
                `http://localhost:5001/feedplanner/us-central1/api/pantry/ingredients`,
                {
                    method: "GET",
                    headers:{
                        Authorization: `Bearer ${token}`,
                        "content-type": "application/json",
                    },
                }
            );
            const ingredients = await response.json();
            const stringIngredients = ingredients.Ingredients;

            const fetchFromApi = await fetch(
                `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${stringIngredients}&number=5`
            );
            const data = await fetchFromApi.json();
            setRecipes(data);

            const recipeIds = data.map((recipe) => recipe.id);
            const idresponse = await fetch(
                `https://api.spoonacular.com/recipes/informationBulk?apiKey=${apiKey}&ids=${recipeIds}`
            );
            const iddata = await idresponse.json();

            const ingredientsMap = {};
            iddata.forEach((recipe) => {
                ingredientsMap[recipe.id] = recipe.extendedIngredients
                    .map((ing) => ing.nameClean)
                    .join(", ");
            });

            const recipesInformationForScoring = iddata.map((recipe) => ({
                id: recipe.id,
                image: recipe.image,
                name: recipe.title,
                ingredients: recipe.extendedIngredients.map((ing) => ing.nameClean),
            }));

            return { recipesInformationForScoring, ingredientsMap };
        } catch (error) {
            throw new Error(error)
        }
    }

    async function getPantry(user) {
        const pantryRef = collection(db, "users", user.uid, "pantry");
        const snapshot = await getDocs(pantryRef);
        return snapshot.docs.map((doc) => doc.data().name.toLowerCase().trim());
    }

    async function getFavorites(user) {
        const favoriteRef = collection(db, "users", user.uid, "favorites");
        const snapshot = await getDocs(favoriteRef);
        return snapshot.docs.map((doc) => doc.data());
    }

    async function getMedianRating(recipeIds){
        const ratings = await Promise.all(
            recipeIds.map(async (recipeId) => {
                const recipeIdDoc = await getDoc(doc(collection(db, "recipeRatings"), recipeId.toString()));
                const data = recipeIdDoc.data();
                return {
                    id: recipeId,
                    medianRating: data ? data.medianRating : null,
                };
            })
        );
        return ratings;
    }
    async function getPantryNameAndExpiry(user) {
        const pantryRef = collection(db, "users", user.uid, "pantry");
        const snapshot = await getDocs(pantryRef);
        return snapshot.docs
            .map((doc) => ({
            name: doc.data().name ? doc.data().name.toLowerCase().trim() : "",
            expiry: doc.data().expiryDate || null
            }))
            .filter(item => {
            if (!item.expiry) return true;
            const expiryDate = new Date(item.expiry);
            const now = new Date();
            return expiryDate >= now;
            });
    }
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const token = await user.getIdToken();
                const pantryList = await getPantry(user);
                const favoritesList = await getFavorites(user);
                const { recipesInformationForScoring, ingredientsMap } = await getRecipes(token);
                setRecipeIngredients(ingredientsMap);
                const recipeIds = recipesInformationForScoring.map(r => r.id);
                const ratingsList = await getMedianRating(recipeIds);
                const urgencyList = await getPantryNameAndExpiry(user)
                if (
                    pantryList &&
                    favoritesList &&
                    ratingsList &&
                    urgencyList &&
                    recipesInformationForScoring.length > 0
                ) {
                    const sortedRecommendations = ScoreRecommendationForRecipes(
                        pantryList,
                        favoritesList,
                        ratingsList,
                        urgencyList,
                        recipesInformationForScoring
                    );
                    setScoredRecipes(sortedRecommendations);
                }

                setLoading(false);
            } else {
                console.log("User not logged in");
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);
    return (
        <div className="recipePage">
            <h1>RECIPES</h1>
            <div className="recipes">
                {loading ? (
                    <div className="loader">
                        <CircularProgress color="success" />
                        <br />
                        Loading..
                    </div>
                ) : (
                    <div className="recipeList">
                        <RecipeList
                            recipes={scoredRecipes}
                            recipeIngredients={recipeIngredients}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
