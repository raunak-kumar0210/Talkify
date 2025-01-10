import React from "react";
import withAuth from "../utils/withAuth.jsx"

function HomeComponent() {
    return (
        <div>
            HomeComponent
        </div>
    )
}

export default withAuth(HomeComponent)