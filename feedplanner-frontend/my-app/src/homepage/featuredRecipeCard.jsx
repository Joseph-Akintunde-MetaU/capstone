import "./FeaturedRecipeCard.css"
import { useState } from "react";
import { ViewRecipes } from "./ViewRecipes";
export function FeaturedRecipeCard({ 
    image, 
    title, 
    readyInMinutes, 
    servings, 
    summary,
    ingredients,
    darkMode,
    healthScore,
    instructions,
    id,
    onClick 
}) {
    const [openModal, setOpenModal] = useState(false)
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

    function healthColor(healthScore) {
        if(healthScore < 50 && healthScore > 35){
            return "#fc6a03"
        }
        if(healthScore < 35){
            return "#b80f0a"
        }
        if (healthScore < 65 && healthScore > 50) {
            return "#ffd700";
        }
        if (healthScore < 80 && healthScore > 65) {
            return "#006ca5";
        }
        return "#028a0f";
    }
    return (
        <>
        <div className="recipeCard" onClick={handleClick}>
            <div className="recipe-image-wrapper">
                <img 
                    src={image || "/placeholder.svg?height=240&width=350"} 
                    alt={title}
                    className="recipe-image"
                />
                <div className="recipe-overlay">
                    <button className="view-recipe-btn" type="button">
                        <span onClick={(e) => {
                            setOpenModal(true)
                            e.stopPropagation()
                            }}>View Recipe</span>
                        <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <div className="recipe-content">
                <h3 className="recipe-title">{title}</h3>
                
                {summary && (
                    <p className="recipe-summary">
                        {stripHtml(summary).substring(0, 100)}...
                    </p>
                )}
                
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
            </div>
        </div>
        {openModal && (
            <ViewRecipes
            closeModal={() => setOpenModal(false)}
            title={title}
            darkMode={darkMode}
            image={image}
            summary={summary}
            instructions={instructions}
            ingredients={ingredients}
        />
        )}
        </>
    );
}