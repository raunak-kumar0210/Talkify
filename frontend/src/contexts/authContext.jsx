import axios from "axios";
import { createContext, useContext, useState } from "react";



export const AuthContext = createContext({});

const client = axios.create({
    baseURL: "localhost:8000/api/vi/users"
})


export const AuthProvider = ({children}) => {

    const authContext = useContext(AuthContext)

    const [userData, setUserData] = useState(authContext);

    const handleRegister = async (name, username, password) => {
        try {
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            })
        } catch(err) {
            throw err;
        }
    }



    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });

            if(request.status === httpStatusCode.OK) {
                localStorage.setItem("token", request.data.token); 
            }
        } catch (err) {
            throw err;
        }
    }


    // const router = useNavigate();

    const data = {
        userData, setUserData, handleRegister, handleLogin
    }

    return (
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>

    )
}