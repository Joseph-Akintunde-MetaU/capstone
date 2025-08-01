import "./RecipeDetails.css"
import { useEffect } from "react"
export function RecipeDetails({closeModal, cuisines, darkMode, title, image, instructions, ingredients, summary, diets, dishTypes}){
    useEffect(() => {
        document.body.style.overflow = "hidden"

        return () => {
        document.body.style.overflow = "unset"
        }
    }, [])
    function stripHtml(html) {
        const div = document.createElement("div");
        div.innerHTML = html;
        return div.textContent || div.innerText || "";
    }

    return (
        <div className="modal-overlay" onClick={closeModal}>
            <div className="modal-container" onClick={(e) => e.stopPropagation()}>
                <img onClick={closeModal} className="modal-close" src={darkMode ? "https://img.icons8.com/?size=100&id=OZuepOQd0omj&format=png&color=000000" : "https://img.icons8.com/?size=100&id=8112&format=png&color=000000"} alt="close" />
                <div className="modal-content">
                    <div className="modal-image-container">
                        <img src={image} alt={title} className="modal-image" />
                    </div>
                    <div className="modal-text">
                        <h2 className="modal-title">{title}</h2>
                        <p className="modal-summary">{stripHtml(summary)}</p>
                        <div>
                            <h4 style={{marginTop: "20px"}}>INSTRUCTIONS: </h4>
                            <p className="modal-summary">{stripHtml(instructions)}</p>      
                        </div>
                        <div>
                            <h4 style={{marginTop: "20px"}}>INGREDIENTS: </h4>
                            <p className="modal-summary">{stripHtml(ingredients)}</p>      
                        </div>
                        <div>
                            <h4 style={{marginTop: "20px"}}>CUISINES</h4>
                            <div className="modal-summary">
                                {Array.isArray(cuisines) && cuisines.length > 0
                                    ? cuisines.map((cuisine, idx) => (
                                        <span key={idx} style={{marginRight: "10px"}}>
                                            {cuisine}
                                        </span>
                                    ))
                                    : <span>{cuisines}</span>
                                }
                            </div>
                        </div>
                        <div>
                            <h4 style={{marginTop: "20px"}}>DISH TYPES</h4>
                            <div className="modal-summary">
                                {Array.isArray(dishTypes) && dishTypes.length > 0
                                    ? dishTypes.map((type, idx) => (
                                        <span key={idx} style={{marginRight: "10px"}}>
                                            {type}
                                        </span>
                                    ))
                                    : <span>Suitable for: {dishTypes}</span>
                                }
                            </div>
                        </div> 
                        <div>
                            <h4 style={{marginTop: "20px"}}>DIETS</h4>
                            <p className="modal-summary">{diets}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}