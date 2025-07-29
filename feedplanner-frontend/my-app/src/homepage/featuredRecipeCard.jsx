import "./FeaturedRecipeCard.css"

export function FeaturedRecipeCard({ 
    image, 
    title, 
    readyInMinutes, 
    servings, 
    summary, 
    dishTypes = [], 
    healthScore,
    id,
    onClick 
}) {
    function handleClick() {
        if (onClick) {
            onClick(id);
        }
    };

   function stripHtml(html){
        if (!html) return '';
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    function getDishTypeColor (dishType) {
        const colors = {
            'breakfast': '#f59e0b',
            'lunch': '#10b981',
            'dinner': '#8b5cf6',
            'dessert': '#ec4899',
            'appetizer': '#06b6d4',
            'snack': '#84cc16',
            'default': '#6b7280'
        };
        return colors[dishType?.toLowerCase()] || colors.default;
    };
    function healthColor(healthScore) {
        if(healthScore < 50){
            return "#ffc100"
        }
        if(healthScore < 35){
            return "#ff0000"
        }
        if (healthScore < 65) {
            return "#ffff00";
        }
        if (healthScore < 80) {
            return "#ff0000";
        }
        return "#63ff00";
    }
    return (
        <div className="recipeCard" onClick={handleClick}>
            <div className="recipe-image-wrapper">
                <img 
                    src={image || "/placeholder.svg?height=240&width=350"} 
                    alt={title}
                    className="recipe-image"
                />
                <div className="recipe-overlay">
                    <button className="view-recipe-btn" type="button">
                        <span>View Recipe</span>
                        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {dishTypes && dishTypes[0] && (
                    <div 
                        className="dish-badge"
                        style={{ backgroundColor: getDishTypeColor(dishTypes[0]) }}
                    >
                        {dishTypes[0]}
                    </div>
                )}
            </div>

            <div className="recipe-content">
                <h3 className="recipe-title">{title}</h3>
                
                {summary && (
                    <p className="recipe-summary">
                        {stripHtml(summary).substring(0, 100)}...
                    </p>
                )}

                {/* Recipe Meta Info */}
                <div className="recipe-meta">
                    {readyInMinutes !== undefined && (
                        <div className="meta-item">
                            <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="10"/>
                                <polyline points="12,6 12,12 16,14"/>
                            </svg>
                            <span>{readyInMinutes} min</span>
                        </div>
                    )}
                    
                    {servings !== undefined && (
                        <div className="meta-item">
                            <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            <span>{servings} servings</span>
                        </div>
                    )}

                    {healthScore !== undefined && (
                        <div className="meta-item health-score" style={{ color: healthColor(healthScore) }}>
                            <svg 
                                className="meta-icon" 
                                viewBox="0 0 24 24" 
                                fill={healthColor(healthScore)} 
                                stroke={healthColor(healthScore)}
                            >
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                            <span>{healthScore}% healthy</span>
                        </div>
                    )}
                </div>

                <button className="recipe-action-btn" type="button">
                    <span>Get Recipe</span>
                    <svg className="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}