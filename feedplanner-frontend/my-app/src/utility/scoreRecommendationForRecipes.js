import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase.config.js";

/**
 * Builds a frequency map of ingredient usage in favorite recipes.
 */
function getFrequencyMap(recipes, favoriteRecipes) {
    const frequencyMap = {};
    recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
            const key = ingredient.toLowerCase().trim();
            // Count how many favorite recipes contain this ingredient
            const count = favoriteRecipes.filter(fav =>
                fav.ingredients.map(i => i.toLowerCase().trim()).includes(key)
            ).length;
            frequencyMap[key] = count;
        });
    });
    return frequencyMap;
}

/**
 * Builds a map of ingredient urgency based on expiry dates.
 */
function getUrgencyMap(pantryNamesAndExpiry, millisecondsInADay) {
    const urgencyMap = {};
    const now = Date.now();
    pantryNamesAndExpiry.forEach(item => {
        if (item.expiry) {
            const expiry = new Date(item.expiry).getTime();
            const daysTillExpiry = Math.ceil((expiry - now) / millisecondsInADay);
            if (daysTillExpiry >= 0) {
                urgencyMap[item.name.toLowerCase().trim()] = daysTillExpiry;
            }
        }
    });
    return urgencyMap;
}

/**
 * Builds a map of recipe ratings.
 */
function getRatingMap(recipes, recipeRatings) {
    const ratingMap = {};
    recipes.forEach(recipe => {
        const key = recipe.id.toString().trim();
        const ratingObj = recipeRatings.find(r => r.id.toString().trim() === key);
        ratingMap[key] = ratingObj ? ratingObj.medianRating : null;
    });
    return ratingMap;
}

/**
 * Builds a map of ingredient recency based on favorite recipe timestamps.
 */
function getRecencyMap(favoriteRecipes) {
    const recencyMap = {};
    favoriteRecipes.forEach(fav => {
        fav.ingredients.forEach(ingredient => {
            const key = ingredient.toLowerCase().trim();
            const time = fav.timestamp;
            // Store the most recent timestamp for each ingredient
            recencyMap[key] = Math.max(recencyMap[key] || 0, time || 0);
        });
    });
    return recencyMap;
}

/**
 * Creates sets for pantry items, favorite ingredients, and their union.
 */
function getSets(pantryItems, favoriteRecipes) {
    const pantrySet = new Set(pantryItems.map(ing => ing.toLowerCase().trim()));
    const favoriteIngredientSet = new Set();
    favoriteRecipes.forEach(fav => {
        fav.ingredients.forEach(ing => favoriteIngredientSet.add(ing.toLowerCase().trim()));
    });
    const combinedSet = new Set([...pantrySet, ...favoriteIngredientSet]);
    return { pantrySet, favoriteIngredientSet, combinedSet };
}

/**
 * Normalizes a score between min and max.
 */
function normalizeScore(score, min, max) {
    return max === min ? 0 : (score - min) / (max - min);
}

/**
 * Calculates user-specific weights for scoring.
 */
function getWeights(data) {
    const weights = { match: 0, frequency: 0, recency: 0, rating: 0, urgency: 0 };
    if (data && data.total > 0) {
        const ratingCount = data.ratingCount || data.rating || 0;
        const ratingSum = data.ratingSum || 0;
        const maxRating = 5 * (ratingCount || 1);
        const averageNorm = ratingCount > 0 ? (ratingSum / maxRating) : 0;
        const ratingWeight = (ratingCount / data.total) * averageNorm;
        for (const weight in weights) {
            if (weight === "rating" && typeof data.rating === "number") {
                weights.rating = ratingWeight;
            } else {
                weights[weight] = (data[weight] || 0) / data.total;
            }
        }
    }
    return weights;
}

/**
 * Scores a single recipe based on pantry, favorites, urgency, etc.
 */
function scoreRecipe(recipe, sets, maps, now, millisecondsInADay) {
    let match = 0, frequency = 0, recency = 0, urgency = 0;
    const rating = maps.ratingMap[recipe.id.toString().trim()];
    recipe.ingredients.forEach(ingredient => {
        const key = ingredient.toLowerCase().trim();
        // Ingredient matches pantry or favorites
        for (const item of sets.combinedSet) {
            if (key.includes(item)) {
                match += 1;
                break;
            }
        }
        // Frequency in favorites
        if (maps.frequencyMap[key]) frequency += maps.frequencyMap[key];
        // Recency: more recent = higher score
        if (maps.recencyMap[key]) {
            const daysAgo = (now - maps.recencyMap[key]) / millisecondsInADay;
            recency += 1 / (daysAgo + 1);
        }
        // Urgency: closer to expiry = higher score
        if (key in maps.urgencyMap) {
            const daysTillExpiry = maps.urgencyMap[key];
            urgency += 1 / (daysTillExpiry + 1);
        }
    });
    return { match, frequency, recency, rating, urgency };
}

/**
 * Main function to score and rank recipes for recommendation.
 */
export async function ScoreRecommendationForRecipes(
    pantryItems,
    favoriteRecipes,
    recipeRatings,
    pantryNamesAndExpiry,
    recipes,
    userId
) {
    const millisecondsInADay = 24 * 60 * 60 * 1000;
    const now = Date.now();

    // Build maps and sets for scoring
    const frequencyMap = getFrequencyMap(recipes, favoriteRecipes);
    const urgencyMap = getUrgencyMap(pantryNamesAndExpiry, millisecondsInADay);
    const ratingMap = getRatingMap(recipes, recipeRatings);
    const recencyMap = getRecencyMap(favoriteRecipes);
    const sets = getSets(pantryItems, favoriteRecipes);

    const maps = { frequencyMap, urgencyMap, ratingMap, recencyMap };

    // Score each recipe
    const scoredRecipes = recipes.map(recipe => ({
        ...recipe,
        scores: scoreRecipe(recipe, sets, maps, now, millisecondsInADay)
    }));

    // Prepare arrays for normalization
    const scoreArrays = {
        match: scoredRecipes.map(r => r.scores.match),
        frequency: scoredRecipes.map(r => r.scores.frequency),
        recency: scoredRecipes.map(r => r.scores.recency),
        rating: scoredRecipes.map(r => r.scores.rating),
        urgency: scoredRecipes.map(r => r.scores.urgency)
    };

    // Find min/max for each score type
    const mins = {};
    const maxs = {};
    for (const key in scoreArrays) {
        mins[key] = Math.min(...scoreArrays[key]);
        maxs[key] = Math.max(...scoreArrays[key]);
    }

    // Fetch user weights from Firestore
    const interactionRef = doc(db, "users", userId, "preferences", "weights");
    const getInteractionRef = await getDoc(interactionRef);
    const data = getInteractionRef.exists() ? getInteractionRef.data() : null;
    const weights = getWeights(data);

    // Normalize scores and calculate final weighted score
    scoredRecipes.forEach(recipe => {
        const { match, frequency, recency, rating, urgency } = recipe.scores;
        recipe.normalizedScores = {
            matchScore: normalizeScore(match, mins.match, maxs.match),
            frequencyScore: normalizeScore(frequency, mins.frequency, maxs.frequency),
            recencyScore: normalizeScore(recency, mins.recency, maxs.recency),
            ratings: normalizeScore(rating, mins.rating, maxs.rating),
            urgencyScore: normalizeScore(urgency, mins.urgency, maxs.urgency)
        };
        recipe.finalScore =
            (recipe.normalizedScores.matchScore * weights.match) +
            (recipe.normalizedScores.frequencyScore * weights.frequency) +
            (recipe.normalizedScores.recencyScore * weights.recency) +
            (recipe.normalizedScores.ratings * weights.rating) +
            (recipe.normalizedScores.urgencyScore * weights.urgency);
    });
    // Return recipes sorted by final score (descending)
    return scoredRecipes.sort((a, b) => b.finalScore - a.finalScore);
}