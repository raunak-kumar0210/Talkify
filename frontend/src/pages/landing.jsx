import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";



function LandingPage() {

    const router = useNavigate();

    return (
        <div className="landingPageContainer">
            <nav>
                <div className="navHeader">
                    <h2 style={{color: "#FFA500"}} >Talkify</h2>
                </div>
                <div className="navList">
                    <p onClick={() => {
                        router("/home")
                    }}>Join As Guest</p>
                    <p onClick={() => {
                        router("/auth") }}>
                            Register</p>
                    <div onClick={() => {
                        router("/auth")
                    }} role="button">
                        <p>Login</p>
                    </div>
                </div>
            </nav>
            

        <div className="landingMainContainer">
            <div>
                <h1>Stay Connected with <span style = {{ color: "#FFA500"}}>Talkify</span></h1>

                <p>No matter the distance</p>
                <div role="button">
                    <Link to={"/auth"} > Get Started</Link>
                </div>
            </div>
            <div>

            <img src="/zoomLanding.png" alt="img" />

            </div>
        </div>
    </div>
    )
}

export default LandingPage;