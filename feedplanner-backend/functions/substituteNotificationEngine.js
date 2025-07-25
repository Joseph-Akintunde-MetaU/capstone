const admin = require('./firebaseAdmin');
const fetch = require('node-fetch');
const pLimit = require('p-limit');
const NodeCache = require('node-cache');

const { retryWithBackoff } = require('./substitutionsUtil');

// Initialize Firestore and cache
const db = admin.firestore();
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 120 });
const limit = pLimit(5); // Limit concurrent async operations
const spoonacularKey = '09acdb4877f5429e998f19def7cd5028';
const weights = 'config/substituteWeights';

// Nutrition scoring plugin
const nutritionPlugin = {
    name: 'NutritionDistance',
    weightKey: 'nutrition',
    /**
     * Scores a candidate ingredient against an expired ingredient based on nutrition distance.
     * Fetches nutrition info from Spoonacular API, caches results, and computes distance.
     */
    async score({ expired, candidate }, tools) {
        const {
            fetch,
            cache,
            retryWithBackoff,
            spoonacularKey
        } = tools;

        const keyExpired = `nutr:${expired.id}`;
        const keyCandidate = `nutr:${candidate.id}`;

        // Helper to fetch and cache nutrition info for an ingredient
        const getNutrition = async (id, key) => {
            if (cache.has(key)) return cache.get(key);

            const js = await retryWithBackoff(async () => {
                const response = await fetch(
                    `https://api.spoonacular.com/food/ingredients/${id}/information?apiKey=${spoonacularKey}&amount=100&unit=gram`
                );
                return response.json();
            });

            // Validate nutrition data
            if (!js || !js.nutrition || !Array.isArray(js.nutrition.nutrients)) {
                return null;
            }

            // Map relevant nutrition fields
            const map = {};
            for (const n of js.nutrition.nutrients) {
                const name = n.name.toLowerCase();
                if (name.includes('calories')) map.calories = n.amount;
                if (name.includes('protein')) map.protein = n.amount;
                if (name.includes('fat')) map.fat = n.amount;
                if (name.includes('carbohydrates')) map.carbohydrates = n.amount;
                if (name.includes('fiber')) map.fiber = n.amount;
                if (name.includes('sodium')) map.sodium = n.amount;
                if (name.includes('sugar')) map.sugar = n.amount;
                if (name.includes('iron')) map.iron = n.amount;
                if (name.includes('calcium')) map.calcium = n.amount;
            }

            cache.set(key, map);
            return map;
        };

        // Fetch nutrition info for expired and candidate ingredients
        const eNut = await getNutrition(expired.id, keyExpired);
        const cNut = await getNutrition(candidate.id, keyCandidate);

        // If nutrition info is missing, return zero score
        if (!eNut || !cNut) {
            return 0;
        }

        // Nutrition fields to compare
        const fields = [
            'calories',
            'protein',
            'fat',
            'carbohydrates',
            'fiber',
            'sodium',
            'sugar',
            'iron',
            'calcium'
        ];

        // Calculate nutrition distance
        const distance = fields.reduce(
            (sum, key) => sum + Math.abs((eNut[key] || 0) - (cNut[key] || 0)),
            0
        );

        // Store distances for later normalization
        const cacheKey = `distances:${expired.id}`;
        const allDistances = cache.get(cacheKey) || [];
        allDistances.push(distance);
        cache.set(cacheKey, allDistances);

        return distance; // Return raw distance, normalize later
    },

    /**
     * Normalizes scores after all candidates are scored using min-max normalization.
     */
    async postNormalize(scores, context) {
        const { expired } = context;
        const cacheKey = `distances:${expired.id}`;
        const allDistances = cache.get(cacheKey) || [];

        if (!allDistances.length) return scores;

        const min = Math.min(...allDistances);
        const max = Math.max(...allDistances);
        const range = max - min || 1;

        // Normalize each score
        return scores.map(s => {
            const distance = allDistances.find(d => {
                return s.breakdown && typeof s.breakdown.nutrition === 'number' &&
                    1 / (1 + d) === s.breakdown.nutrition;
            }) ?? max;

            const normalized = 1 - ((distance - min) / range);
            return {
                ...s,
                score: normalized,
                breakdown: { nutrition: normalized }
            };
        });
    }
};

// Only nutrition plugin remains
const plugins = [
    nutritionPlugin,
];

// Main substitution engine class
class SubstitutionNutritionEngine {
    /**
     * Gets user-specific weights for plugins from Firestore.
     * If not found, defaults to weight 1 for all plugins.
     */
    static async getWeights(userId) {
        const snapshot = await db.doc(weights).get();
        if (snapshot.exists) {
            const user = snapshot.data();
            return plugins.reduce((o, p) => {
                const k = p.weightKey;
                o[k] = (typeof user[k] === 'number' && user[k] > 0) ? user[k] : 1;
                return o;
            }, {});
        }
        return plugins.reduce((o, p) => {
            o[p.weightKey] = 1;
            return o;
        }, {});
    }

    /**
     * Finds top substitute ingredients for an expired ingredient name.
     * Uses nutrition distance for scoring and returns top substitutes.
     */
    static async findTopSubstitutes(expiredName, userId, topSubs = 2, extraContext = {}) {
        // Fetch Spoonacular ID for expired ingredient
        const expiredId = await this.fetchIngredientId(expiredName);
        if (!expiredId) {
            return [];
        }

        // Get weights for scoring
        const weights = extraContext.overrideWeights
            ? extraContext.overrideWeights
            : await this.getWeights(userId);

        // Fetch candidate substitute names
        const candidates = await this.fetchCandidateSubstitutes(expiredId, expiredName, userId);
        if (!candidates || !candidates.length) {
            return [];
        }

        const allRawScores = [];

        // Score each candidate using nutrition plugin
        const scored = await Promise.all(
            candidates.map(name =>
                limit(async () => {
                    const cid = await this.fetchIngredientId(name);
                    if (!cid) {
                        return null;
                    }

                    const ctx = {
                        expired: { name: expiredName, id: expiredId },
                        candidate: { name, id: cid },
                        userId,
                        weights,
                    };

                    const tools = {
                        db,
                        fetch,
                        cache,
                        retryWithBackoff,
                        spoonacularKey,
                    };

                    let rawNutritionScore = 0;

                    for (const p of plugins) {
                        try {
                            const pluginScore = await p.score(ctx, tools);
                            rawNutritionScore = pluginScore; // Only one plugin
                            allRawScores.push({
                                name,
                                raw: pluginScore,
                            });
                        } catch (error) {
                            rawNutritionScore = 0;
                            allRawScores.push({
                                name,
                                raw: 0,
                            });
                        }
                    }

                    return {
                        name,
                        raw: rawNutritionScore,
                    };
                })
            )
        );

        // Filter out failed candidates
        const valid = scored.filter(Boolean);
        if (!valid.length) {
            return [];
        }

        // Normalize scores using min-max normalization
        const rawValues = valid.map(s => s.raw);
        const min = Math.min(...rawValues);
        const max = Math.max(...rawValues);
        const range = max - min || 1;

        const normalized = valid.map(s => ({
            name: s.name,
            score: 1 - ((s.raw - min) / range),
            breakdown: {
                nutrition: 1 - ((s.raw - min) / range),
            },
        }));

        // Sort by normalized score descending
        normalized.sort((a, b) => b.score - a.score);

        // Return top substitutes
        return normalized.slice(0, topSubs);
    }

    /**
     * Fetches Spoonacular ingredient ID by name, with caching.
     */
    static async fetchIngredientId(name) {
        const key = `id: ${name.toLowerCase().trim()}`;
        if (cache.has(key)) {
            return cache.get(key);
        }
        const js = await retryWithBackoff(async () => {
            const response = await fetch(`https://api.spoonacular.com/food/ingredients/search/?query=${encodeURIComponent(name)}&apiKey=${spoonacularKey}`);
            return response.json();
        });
        if (!js.results || !Array.isArray(js.results) || js.results.length === 0 || !js.results[0].id) {
            return null;
        }
        cache.set(key, js.results[0].id);
        return js.results[0].id;
    }

    /**
     * Fetches candidate substitute ingredient names for a given ingredient ID.
     * Cleans and filters names using dynamic unit extraction.
     */
    static async fetchCandidateSubstitutes(id, expiredName, userId) {
        const key = `subs:${id}`;
        if (cache.has(key)) {
            return cache.get(key);
        }

        const js = await retryWithBackoff(async () => {
            const response = await fetch(
                `https://api.spoonacular.com/food/ingredients/${id}/substitutes?apiKey=${spoonacularKey}`
            );
            return response.json();
        });

        const rawSubs = js.substitutes || [];

        // Build set of units for filtering ingredient names
        const unitSet = new Set([
            'cup', 'cups', 'tsp', 'tbsp', 'tablespoon', 'teaspoon', 'ounce', 'oz',
            'ml', 'liter', 'l', 'g', 'gram', 'grams', 'kg', 'and'
        ]);

        // dynamic set of units from the API
        try {
            const info = await retryWithBackoff(async () => {
                const response = await fetch(
                    `https://api.spoonacular.com/food/ingredients/${id}/information?apiKey=${spoonacularKey}&includeNutrition=true`
                );
                return response.json();
            });

            // Add units from possibleUnits array if available
            if (Array.isArray(info.possibleUnits)) {
                for (const unit of info.possibleUnits) {
                    const cleaned = unit.toLowerCase().replace(/[^a-z]/gi, '');
                    if (cleaned) unitSet.add(cleaned);
                }
            }

            // Add units from nutrition info
            if (info.nutrition?.nutrients) {
                for (const n of info.nutrition.nutrients) {
                    if (n.unit) {
                        const cleaned = n.unit.toLowerCase().replace(/[^a-z]/gi, '');
                        if (cleaned) unitSet.add(cleaned);
                    }
                }
            }

            // Add unit from info.unit
            if (info.unit) {
                const cleaned = info.unit.toLowerCase().replace(/[^a-z]/gi, '');
                if (cleaned) unitSet.add(cleaned);
            }
        } catch (err) {
            // Ignore errors in unit extraction
        }

        /**
         * Extracts ingredient name from a substitute string, removing units and numbers.
         */
        function extractIngredientName(str) {
            const parts = str.split(/[=+]/);
            const candidates = parts.map(p =>
                p
                    .replace(/[\d/]+/g, '')            // Remove numbers/fractions
                    .replace(/[^a-zA-Z\s]/g, '')       // Remove punctuation
                    .trim()
                    .toLowerCase()
            );

            for (const c of candidates) {
                const words = c.split(' ').filter(Boolean);
                const nonUnitWords = words.filter(w =>
                    !unitSet.has(w) && !unitSet.has(w.endsWith('s') ? w.slice(0, -1) : w)
                );
                const final = nonUnitWords.join(' ').trim();
                if (final.length > 2 && final !== '') return final;
            }

            return null;
        }

        // Clean and filter candidate substitute names
        const list = rawSubs
            .map(r => extractIngredientName(r))
            .filter(Boolean);

        cache.set(key, list);
        return list;
    }
}

// Export the engine class
module.exports = SubstitutionNutritionEngine;
