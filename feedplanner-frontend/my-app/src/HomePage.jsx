import { useNavigate } from 'react-router-dom'
import './HomePage.css'
export function HomePage({isSignedOut}){
    const email = localStorage.getItem("email")
    const nav = useNavigate()
    return(
        <div>
            <header>
                <img src="img/logo.png" alt="2025 FeedPlanner &copy;" />
                <nav>
                    <p>Welcome {email ? email : nav('/errorpage')}</p>
                    <li>RECIPES</li>
                    <li>MEAL PLANNER</li>
                    <li style={{cursor: "pointer"}} onClick={isSignedOut}>LOGOUT</li>
                </nav>
            </header>
        </div>
    )
}