import axios from "axios";

import httpStatus from "http-status";

import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";



export const AuthContext = createContext({});

const client = axios.create({
    baseURL: "http://localhost:8000/api/v1/users", // Backend API base URL
});


export const AuthProvider = ({children}) => {

    const authContext = useContext(AuthContext)

    const [userData, setUserData] = useState(authContext);

    const handleRegister = async (name, username, password) => {
        try {
            const response = await client.post("/register", {
                name,
                username,
                password,
            });
    
            console.log("Registration Response:", response);
    
            if (response.status === 201) {
                return response.data.message;
            } else {
                throw new Error(`Unexpected response: ${response.status}`);
            }
        } catch (err) {
            // console.error("Error during registration:", err);
            throw new Error(err.response?.data?.message || "Unknown registration error.");
        }
    };


    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });

            if(request.status === httpStatus.OK) {
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




// import axios from "axios";
// import httpStatus from "http-status";
// import { createContext, useContext, useState } from "react";
// import { useNavigate } from "react-router-dom";

// export const AuthContext = createContext({});

// const client = axios.create({
//     baseURL: "http://localhost:8000/api/v1/users",
//     
// });

// export const AuthProvider = ({ children }) => {
//     const navigate = useNavigate();
//     const [userData, setUserData] = useState(() => {
//         const storedData = localStorage.getItem("userData");
//         return storedData ? JSON.parse(storedData) : null;
//     });
//     const [error, setError] = useState(null);

//     const handleRegister = async (name, username, password) => {
//         try {
//             const request = await client.post("/register", {
//                 name,
//                 username,
//                 password,
//             });

//             if (request.status === httpStatus.CREATED) {
//                 return request.data.message;
//             }
//         } catch (err) {
//             setError(err.message);
//             throw err;
//         }
//     };

//     const handleLogin = async (username, password) => {
//         try {
//             const request = await client.post("/login", {
//                 username,
//                 password,
//             });

//             if (request.status === httpStatus.OK) {
//                 localStorage.setItem("token", request.data.token);
//                 setUserData(request.data.user); // Assuming user info is returned
//                 navigate("/home"); // Redirect after login
//             }
//         } catch (err) {
//             setError(err.message);
//             throw err;
//         }
//     };

//     const handleLogout = () => {
//         localStorage.removeItem("token");
//         setUserData(null);
//         navigate("/login"); // Redirect to login page after logout
//     };

//     const data = {
//         userData,
//         setUserData,
//         handleRegister,
//         handleLogin,
//         handleLogout,
//         error,
//     };

//     return (
//         <AuthContext.Provider value={data}>
//             {children}
//             {error && <div className="error-message">{error}</div>} {/* Display error messages */}
//         </AuthContext.Provider>
//     );
// };

// // Custom hook for easier access to the auth context
// export const useAuth = () => useContext(AuthContext);
