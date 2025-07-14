import { useState } from "react"
import { auth } from "../config/firebase.config";
import { updatePassword} from "firebase/auth";
export function ChangePassword({close, isSignedOut}){
    const [newPassword, setNewPassword] = useState('')
    async function handleChangePassword(){
        const user = auth.currentUser;
        updatePassword(user, newPassword).then(async () => {
            await isSignedOut()
            alert("Password Reset Successful")
        }).catch((error) => {
            console.error(error)
        })
    }
    return(
        <div>
            <form>
                <label>New Password</label>
                <input type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}/>
                <button onClick={handleChangePassword}>SUBMIT</button>
            </form>
            <button onClick={() => close(false)}>CLOSE</button>
        </div>
    )
}