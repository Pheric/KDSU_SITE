import * as React from "react";

import COLORSCHEME from "../ColorScheme"

import ShadowBoxing from "shadowboxing"

import { Link } from "react-router-dom"

class Contact extends React.Component {

    public render() {
        const componentWrapperStyle: React.CSSProperties = {
            backgroundColor: COLORSCHEME.secondaryLight,
            display: "block",
            height: "100%",
            margin: "5%",
            maxWidth: "100%",
            minHeight: "auto",
            width: "100%",
        }

        return (
            <ShadowBoxing level={4} style={componentWrapperStyle}>
                <div style={{ backgroundColor: COLORSCHEME.secondary, display: "flex", padding: "3%", justifyContent: "flex-start" }}>
                    <span style={{ color: COLORSCHEME.secondaryText, fontSize: "6vw", }} >
                        About
                    </span>
                </div>
                <div style={{ alignItems: "center", color: COLORSCHEME.secondaryText, display: "flex", fontSize: "3vw", height: "100%", justifyContent: "center", padding: "3%", }}>
                    <div>
                        KDSU is the <span style={{ fontWeight: "bold" }}> student lead </span> radio organization at Dakota State University.
                    </div>
                </div>
                <div style={{ backgroundColor: COLORSCHEME.secondaryDark, display: "flex", padding: "1%", justifyContent: "flex-start" }}>
                    <Link to="/contact" style={{ textDecoration: "none", width: "100%", }}>
                        <span style={{ color: COLORSCHEME.secondaryText, fontSize: "4vw", }} >
                            Contact
                        </span>
                    </Link>
                </div>
            </ShadowBoxing>
        );
    }
}

export default Contact;
