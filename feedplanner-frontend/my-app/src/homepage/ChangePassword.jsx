import { useState } from "react"
import { auth } from "../config/firebase.config";
import { updatePassword} from "firebase/auth";
export function ChangePassword({close, isSignedOut}){
    const [newPassword, setNewPassword] = useState('')
    async function handleChangePassword(){
        const user = auth.currentUser;
        updatePassword(user, newPassword).then(async () => {
            await isSignedOut()
            console.log("Password Reset Successful")
        }).catch((error) => {
            throw new Error(error)
        })
    }
    return(
        <div>
            <form>
                <label>New Password</label>
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                <button onClick={handleChangePassword}>SUBMIT</button>
            </form>
            <button onClick={() => close(false)}>CLOSE</button>
        </div>
    )
}