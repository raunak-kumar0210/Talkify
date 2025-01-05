import React from "react";
import "../App.css";
import { Link } from "react-router-dom";

function LandingPage() {
    return (
        <div className="landingPageConatiner">
            <nav>
                <div className="navHeader">
                    <h2>Talkify</h2>
                </div>
                <div className="navList">
                    <p>Join As Guest</p>
                    <p>Register</p>
                    <div role="button">
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

                <img src="./mobile_img.png" alt="img"/>

            </div>
        </div>
    </div>
    )
}

export default LandingPage;