export function HomePage({isSignedOut}){
    const email = localStorage.getItem("email")
    return(
        <div>
            <header>
                <img src="img/logo.png" alt="" />
                <nav>
                    <p>Welcome {email ? email : ''}</p>
                    <li>RECIPES</li>
                    <li>MEAL PLANNER</li>
                    <li style={{cursor: "pointer"}} onClick={isSignedOut}>LOGOUT</li>
                </nav>
            </header>
        </div>
    )
}