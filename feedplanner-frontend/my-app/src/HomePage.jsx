export function HomePage({isSignedOut}){
    return(
        <div>
            <header>
                <img src="img/logo.png" alt="" />
                <nav>
                    <li>RECIPES</li>
                    <li>MEAL PLANNER</li>
                    <li style={{cursor: "pointer"}} onClick={isSignedOut}>LOGOUT</li>
                </nav>
            </header>
        </div>
    )
}