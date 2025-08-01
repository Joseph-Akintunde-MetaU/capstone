import { useState, useEffect } from "react";
import { RecipeList } from "./RecipeList";
import "./recipePage.css";
import { auth, db } from "../config/firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import CircularProgress from "@mui/material/CircularProgress";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { ScoreRecommendationForRecipes } from "../utility/scoreRecommendationForRecipes";

export function RecipePage({
    recipes,
    darkMode,
    setRecipes,
    scoredRecipes,
    setScoredRecipes,
    recipeIngredients,
    setRecipeIngredients,
}) {
    const [filter, setFilter] = useState("none");
    const [dietaryFilters, setDietaryFilters] = useState({
    vegetarian: false,
    vegan: false,
    glutenFree: false,
    dairyFree: false
    });
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0)
    const apiKey = process.env.REACT_APP_API_KEY;

    useEffect(() => {
        if (loading) {
        const interval = setInterval(() => {
            setLoadingProgress((prev) => {
            if (prev >= 90) return prev
            return prev + Math.random() * 10
            })
        }, 200)
        return () => clearInterval(interval)
        }
    }, [loading])

    async function getRecipes(token) {
        try {
            const response = await fetch(
                "http://localhost:5001/feedplanner/us-central1/api/pantry/ingredients",
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "content-type": "application/json",
                    },
                }
            );
            const ingredients = await response.json();
            const stringIngredients = ingredients.Ingredients;

            const fetchFromApi = await fetch(
                `https://api.spoonacular.com/recipes/findByIngredients?apiKey=${apiKey}&ingredients=${stringIngredients}&number=10`
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
                    .join(",");
            });

            const recipesInformationForScoring = iddata.map((recipe) => ({
                id: recipe.id,
                image: recipe.image,
                name: recipe.title,
                ingredients: recipe.extendedIngredients.map((ing) => ing.nameClean),
                cookTime: recipe.readyInMinutes ? `${recipe.readyInMinutes} min` : "30 min",
                cuisines: recipe.cuisines,
                dishTypes: recipe.dishTypes,
                diets: recipe.diets,
                servings: recipe.servings,
                pricePerServing: recipe.pricePerServing,
                healthScore: recipe.healthScore || 0,
                instructions: recipe.instructions,
                summary: recipe.summary
            }));

            return { recipesInformationForScoring, ingredientsMap };
        } catch (error) {
            throw new Error(error);
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

    async function getMedianRating(recipeIds) {
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
                expiry: doc.data().expiryDate || null,
            }))
            .filter((item) => {
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
                const recipeIds = recipesInformationForScoring.map((r) => r.id);
                const ratingsList = await getMedianRating(recipeIds);
                const urgencyList = await getPantryNameAndExpiry(user);

                if (
                    pantryList.length &&
                    favoritesList.length &&
                    ratingsList.length &&
                    urgencyList.length &&
                    recipesInformationForScoring.length
                ) {
                    const sortedRecommendations = await ScoreRecommendationForRecipes(
                        pantryList,
                        favoritesList,
                        ratingsList,
                        urgencyList,
                        recipesInformationForScoring,
                        user.uid
                    );
                    setScoredRecipes(sortedRecommendations);
                }
                setLoading(false);
            } else {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);
    function getFilteredRecipes() {
        if (!scoredRecipes) return [];
        let filtered = [...scoredRecipes];
         if (dietaryFilters.vegetarian) {
            filtered = filtered.filter(r => r.diets && r.diets.includes("vegetarian"));
        }
        if (dietaryFilters.vegan) {
            filtered = filtered.filter(r => r.diets && r.diets.includes("vegan"));
        }
        if (dietaryFilters.glutenFree) {
            filtered = filtered.filter(r => r.diets && r.diets.includes("gluten free"));
        }
        if(dietaryFilters.dairyFree){
            filtered = filtered.filter(r => r.diets && r.diets.includes("dairy free"))
        }
        if (filter === "healthScore") {
            filtered.sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0));
        } else if (filter === "cookTime") {
            filtered.sort((a, b) => {
            const timeA = parseInt(a.cookTime) || 0;
            const timeB = parseInt(b.cookTime) || 0;
            return timeA - timeB;
            });
        } else if (filter === "rating") {
            filtered.sort((a, b) => (b.medianRating || 0) - (a.medianRating || 0));
        }
        return filtered;
    }
    return (
        <div className="recipePage">
            <div className="page-header">
                <h1>DISCOVER RECIPES</h1>
                <p className="page-subtitle">Personalized recommendations based on your pantry and preferences</p>
            </div>
            <div className="recipes">
            {loading ? (
                <div className="loader">
                    <div className="loading-container">
                        <CircularProgress color="success" size={60} thickness={4} />
                        <div className="loading-progress">
                            <div className="progress-bar" style={{ width: `${loadingProgress}%` }}></div>
                        </div>
                        <p className="loading-text">
                            {loadingProgress < 30
                                ? "Analyzing your pantry..."
                                : loadingProgress < 60
                                ? "Finding perfect recipes..."
                                : loadingProgress < 90
                                ? "Calculating recommendations..."
                                : "Almost ready!"}
                        </p>
                    </div>
                </div>
                ) : (
                <div className="recipeList">
                    <div className="filter-container">
                        <div className="filter-row">
                            <label className="sort-label">Sort by:</label>
                            <select 
                                className="sort-select"
                                value={filter} 
                                onChange={e => setFilter(e.target.value)}
                            >
                                <option value="none">Default</option>
                                <option value="healthScore">Health Score</option>
                                <option value="cookTime">Cook Time</option>
                                <option value="rating">Highest Rating</option>
                            </select>
                        </div>

                        <div className="filter-row">
                            <span className="filter-title">Dietary Preferences:</span>
                        </div>

                        <div className="filter-row checkbox-row">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={dietaryFilters.vegetarian}
                                    onChange={e => setDietaryFilters(f => ({ ...f, vegetarian: e.target.checked }))}
                                />
                                Vegetarian
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={dietaryFilters.vegan}
                                    onChange={e => setDietaryFilters(f => ({ ...f, vegan: e.target.checked }))}
                                />
                                Vegan
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={dietaryFilters.glutenFree}
                                    onChange={e => setDietaryFilters(f => ({ ...f, glutenFree: e.target.checked }))}
                                />
                                Gluten-Free
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={dietaryFilters.dairyFree}
                                    onChange={e => setDietaryFilters(f => ({ ...f, dairyFree: e.target.checked }))}
                                />
                                Dairy-Free
                            </label>
                        </div>
                    </div>
                    <RecipeList recipes={getFilteredRecipes()} recipeIngredients={recipeIngredients} darkMode={darkMode} />
                </div>
                )}
            </div>
        </div>
    )
}