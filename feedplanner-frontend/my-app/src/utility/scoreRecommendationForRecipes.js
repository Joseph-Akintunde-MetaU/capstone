import { doc, getDoc } from "firebase/firestore"
import { db } from "../config/firebase.config.js"
export async function ScoreRecommendationForRecipes(pantryItems, favoriteRecipes, recipeRatings, pantryNamesAndExpiry, recipes, userId){
    const millisecondsInADay = 24 * 60 * 60 * 1000
    const frequencyMap = {}
    recipes.forEach((recipe) => {
        recipe.ingredients.forEach((ingredient) => {
                const key = ingredient.toLowerCase().trim()
                const count = favoriteRecipes.filter(fav => fav.ingredients.map
                    (i => i.toLowerCase().trim()).includes(key))
                    .length;
                frequencyMap[key] = count;
        })
    })
    const urgencyMap = {}
    const now = Date.now()
    pantryNamesAndExpiry.forEach((item) => {
        if (item.expiry) {
            const expiry = new Date(item.expiry).getTime();
            const daysTillExpiry = Math.ceil((expiry - now) / millisecondsInADay);
            if (daysTillExpiry >= 0) {
                urgencyMap[item.name.toLowerCase().trim()] = daysTillExpiry;
            }
        }
    })

    const ratingMap = {};
    recipes.forEach((recipe) => {
        const key = recipe.id.toString().trim();
        const ratingObj = recipeRatings.find(r => r.id.toString().trim() === key);
        ratingMap[key] = ratingObj ? ratingObj.medianRating : null;
    });

    const recencyMap = {}
    favoriteRecipes.forEach((fav) => {
        fav.ingredients.forEach((ingredient) => {
            const key = ingredient.toLowerCase().trim()
            const time = fav.timestamp
                recencyMap[key] = Math.max(recencyMap[key] || 0, time || 0)
        })
    })

    const favoriteIngredientSet = new Set()
    favoriteRecipes.forEach(fav => {
        fav.ingredients.forEach((ing) => favoriteIngredientSet.add
        (ing.toLowerCase().trim()))
    })

    const pantrySet = new Set(pantryItems.map
        ((ing) => ing.toLowerCase().trim())
    )
    
    const scoredRecipes = []
    const date = Date.now()
    recipes.forEach(recipe => {
        let match = 0;
        let frequency = 0;
        let recency = 0;
        let rating = ratingMap[recipe.id.toString().trim()]
        let urgency = 0
        recipe.ingredients.forEach((ingredient) => {
            const key = ingredient.toLowerCase().trim();

            for (const pantryItem of pantrySet) {
                if (key.includes(pantryItem)) {
                    match += 1;
                    break;
                }
            }

            if(frequencyMap[key]){
                frequency += frequencyMap[key]
            }

            if(recencyMap[key]){
                const daysAgo = (date - recencyMap[key]) / millisecondsInADay
                recency += 1 / (daysAgo + 1)
            }

            if(key in urgencyMap){
                const daysTillExpiry = (urgencyMap[key])
                urgency += 1 / (daysTillExpiry + 1)
            }
        });
        scoredRecipes.push({
            ...recipe,
            scores: {
                match: match,
                frequency: frequency,
                recency: recency,
                rating: rating,
                urgency: urgency
            }
        })
    })
    const matchScores = scoredRecipes.map((r) => r.scores.match);
    const frequencyScores = scoredRecipes.map((r) => r.scores.frequency)
    const recencyScores = scoredRecipes.map((r) => r.scores.recency)
    const ratings = scoredRecipes.map((r) => r.scores.rating)
    const urgencyScores = scoredRecipes.map((r) => r.scores.urgency)
    function normalizeScore(score, min, max){
        return (
            max === min ? 
            0 :
            (score - min)/(max - min)
        )
    }
    const matchMin = Math.min(...matchScores)
    const matchMax = Math.max(...matchScores)
    const frequencyMin = Math.min(...frequencyScores)
    const frequencyMax = Math.max(...frequencyScores)
    const recencyMin = Math.min(...recencyScores)
    const recencyMax = Math.max(...recencyScores)
    const ratingMin = Math.min(...ratings)
    const ratingMax = Math.max(...ratings)
    const urgencyMin = Math.min(...urgencyScores)
    const urgencyMax = Math.max(...urgencyScores)
    const interactionRef = doc(db, "users", userId, "preferences", "weights")
    const getInteractionRef = await getDoc(interactionRef)
    const data = getInteractionRef.exists() ? getInteractionRef.data() : null
    const weights = {match: 0, frequency: 0, recency: 0, rating: 0, urgency: 0}
    if(data && data.total > 0){
        for (const weight in weights){
            weights[weight] = (data[weight] || 0)/data.total
        }
    }
    scoredRecipes.forEach((recipe) => {
        const {match, frequency, recency, rating, urgency} = recipe.scores
        recipe.normalizedScores = {
            matchScore: normalizeScore(match, matchMin, matchMax),
            frequencyScore: normalizeScore(frequency, frequencyMin, frequencyMax),
            recencyScore: normalizeScore(recency, recencyMin, recencyMax),
            ratings: normalizeScore(rating, ratingMin, ratingMax),
            urgencyScore: normalizeScore(urgency, urgencyMin, urgencyMax),
        }
    })
    scoredRecipes.forEach((recipe) => {
        const normalizedScoresForRecipe = recipe.normalizedScores;
        recipe.finalScore = 
            (normalizedScoresForRecipe['matchScore'] * weights.match) +
            (normalizedScoresForRecipe['frequencyScore'] * weights.frequency) +
            (normalizedScoresForRecipe['recencyScore'] * weights.recency) +
            (normalizedScoresForRecipe['ratings'] * weights.rating) +
            (normalizedScoresForRecipe['urgencyScore'] * weights.urgency)
    })
    const sortedRecipes = scoredRecipes.sort((a, b) => b.finalScore - a.finalScore)
    return sortedRecipes
}