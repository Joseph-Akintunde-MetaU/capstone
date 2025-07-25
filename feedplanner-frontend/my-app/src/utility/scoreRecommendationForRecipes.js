import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase.config.js";

function getFrequencyMap(recipes, favoriteRecipes) {
    const frequencyMap = {};
    recipes.forEach(recipe => {
        recipe.ingredients.forEach(ingredient => {
            const key = ingredient.toLowerCase().trim();
            const count = favoriteRecipes.filter(fav =>
                fav.ingredients.map(i => i.toLowerCase().trim()).includes(key)
            ).length;
            frequencyMap[key] = count;
        });
    });
    return frequencyMap;
}

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

function getRatingMap(recipes, recipeRatings) {
    const ratingMap = {};
    recipes.forEach(recipe => {
        const key = recipe.id.toString().trim();
        const ratingObj = recipeRatings.find(r => r.id.toString().trim() === key);
        ratingMap[key] = ratingObj ? ratingObj.medianRating : null;
    });
    return ratingMap;
}

function getRecencyMap(favoriteRecipes) {
    const recencyMap = {};
    favoriteRecipes.forEach(fav => {
        fav.ingredients.forEach(ingredient => {
            const key = ingredient.toLowerCase().trim();
            const time = fav.timestamp;
            recencyMap[key] = Math.max(recencyMap[key] || 0, time || 0);
        });
    });
    return recencyMap;
}

function getSets(pantryItems, favoriteRecipes) {
    const pantrySet = new Set(pantryItems.map(ing => ing.toLowerCase().trim()));
    const favoriteIngredientSet = new Set();
    favoriteRecipes.forEach(fav => {
        fav.ingredients.forEach(ing => favoriteIngredientSet.add(ing.toLowerCase().trim()));
    });
    const combinedSet = new Set ([...pantrySet, ...favoriteIngredientSet])
    return { pantrySet, favoriteIngredientSet, combinedSet };
}

function normalizeScore(score, min, max) {
    return max === min ? 0 : (score - min) / (max - min);
}

function getWeights(data) {
    const weights = { match: 0, frequency: 0, recency: 0, rating: 0, urgency: 0 };
    if (data && data.total > 0) {
        //number of times user rates a recipe
        const ratingCount = data.ratingCount || data.rating || 0;
        //sum of all his ratings (i.e if he rates 5 star, 5 star and 3 star it'd be 13)
        const ratingSum = data.ratingSum || 0;
        //max rating is highest number of possible rating (5) * the number of times he rates
        const maxRating = 5 * (ratingCount || 1);
        //average rating is the max rating divided by user's summed ratings. keeps scale within 0-1
        const averageNorm = ratingCount > 0 ? (ratingSum / maxRating) : 0;
        //relates their weighting value to the weight (i.e recipe with average of 3/15 would have less weight than recipe with average of 12/15)
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

function scoreRecipe(recipe, sets, maps, now, millisecondsInADay) {
    let match = 0, frequency = 0, recency = 0, urgency = 0;
    const rating = maps.ratingMap[recipe.id.toString().trim()];
    recipe.ingredients.forEach(ingredient => {
        const key = ingredient.toLowerCase().trim();
        for (const item of sets.combinedSet) {
            if (key.includes(item)) {
                match += 1;
                break;
            }
        }
        if (maps.frequencyMap[key]) frequency += maps.frequencyMap[key];
        if (maps.recencyMap[key]) {
            const daysAgo = (now - maps.recencyMap[key]) / millisecondsInADay;
            recency += 1 / (daysAgo + 1);
        }
        if (key in maps.urgencyMap) {
            const daysTillExpiry = maps.urgencyMap[key];
            urgency += 1 / (daysTillExpiry + 1);
        }
    });
    return { match, frequency, recency, rating, urgency };
}

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

    const frequencyMap = getFrequencyMap(recipes, favoriteRecipes);
    const urgencyMap = getUrgencyMap(pantryNamesAndExpiry, millisecondsInADay);
    const ratingMap = getRatingMap(recipes, recipeRatings);
    const recencyMap = getRecencyMap(favoriteRecipes);
    const sets = getSets(pantryItems, favoriteRecipes);

    const maps = { frequencyMap, urgencyMap, ratingMap, recencyMap };

    const scoredRecipes = recipes.map(recipe => ({
        ...recipe,
        scores: scoreRecipe(recipe, sets, maps, now, millisecondsInADay)
    }));

    // Gather score arrays for normalization
    const scoreArrays = {
        match: scoredRecipes.map(r => r.scores.match),
        frequency: scoredRecipes.map(r => r.scores.frequency),
        recency: scoredRecipes.map(r => r.scores.recency),
        rating: scoredRecipes.map(r => r.scores.rating),
        urgency: scoredRecipes.map(r => r.scores.urgency)
    };

    // Min/max for normalization
    const mins = {};
    const maxs = {};
    for (const key in scoreArrays) {
        mins[key] = Math.min(...scoreArrays[key]);
        maxs[key] = Math.max(...scoreArrays[key]);
    }

    // Get user weights
    const interactionRef = doc(db, "users", userId, "preferences", "weights");
    const getInteractionRef = await getDoc(interactionRef);
    const data = getInteractionRef.exists() ? getInteractionRef.data() : null;
    const weights = getWeights(data);

    // Normalize and calculate final score
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

    return scoredRecipes.sort((a, b) => b.finalScore - a.finalScore);
}