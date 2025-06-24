import { useState } from "react"
import "/UserAuthPage.css"
export function UserAuthPage(){
    const {username, setUsername} = useState('')
    return(
             <div className="UserAuthPage">
                <img width = "400px" height= "400px" src="img/logo.png" alt="" />
                <div className="userInputs">
                    <p>WELCOME BACK!</p>
                    <label >Username: 
                        <input type="text" />
                    </label>
                     <label >Password: 
                        <input type="password" />
                    </label>
                    <button>SIGN IN</button>
                </div>
                <p>New here? <a href="">Sign Up</a></p>
        </div>
    )
}