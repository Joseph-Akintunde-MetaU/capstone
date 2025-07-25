export function getExpiringIngredients(pantry, daysThreshold = 3) {
    const now = Date.now();
    const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;
    return pantry
        .filter(item => {
            if (!item.expiryDate) {
                return false;
            }
            const expiry = new Date(item.expiryDate).getTime();
            return expiry - now <= thresholdMs && expiry >= now;
        })
        .map(item => item.name.toLowerCase().trim());
}
