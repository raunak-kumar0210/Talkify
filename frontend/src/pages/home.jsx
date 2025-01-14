import React, { useState, useContext} from "react";
import withAuth from "../utils/withAuth.jsx"
import { useNavigate } from "react-router-dom";
import "../App.css";
import {IconButton, Button, TextField} from "@mui/material"
import RestoreIcon from "@mui/icons-material/Restore"
import { AuthContext } from "../contexts/authContext.jsx";


function HomeComponent() {

    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState();
    const {addToUserHistory} = useContext(AuthContext);

    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    } 

    return (
        <>
            <div className="navBar">
                <div style={{ display: "flex", alignItems: "center"}}>

                    <h2>Talkify</h2>

                </div>

                <div style={{ display: 'flex', alignItems: "center"}}>
                    <IconButton onClick={
                        () => {
                            navigate("/history")
                        }
                    }>
                        <RestoreIcon />
                    </IconButton>
                    <p>History</p>

                    <Button onClick={() => {
                        localStorage.removeItem("token")
                        navigate("/auth")
                    }}>Logout</Button>
                </div>
            </div>

            <div className="meetingContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Experience the finest quality video calls!</h2>

                        <div style={{display: 'flex', gap: "10px"}}>

                            <TextField onChange={e => setMeetingCode(e.target.value)} id="outlined-basic" label="Meeting Code" varient="outlined"></TextField>
                            <Button onClick={handleJoinVideoCall} varient="contained">Join Call</Button>
                        </div>
                    </div>
                </div>

                <div className="rightPanel">
                    <img srcSet="/logo1.png" alt="logo" />

                </div>

            </div>
        </>
    )
}

export default withAuth(HomeComponent)