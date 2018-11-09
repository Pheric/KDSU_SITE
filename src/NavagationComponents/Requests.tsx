import * as React from "react";

import COLORSCHEME from "../ColorScheme"

import ShadowBoxing from "shadowboxing"

// import * as SIO from "socket.io-client"

import { Link } from "react-router-dom"

// import ServerURL from "../ServerURL"

// import WebSocketBuilder from "../WebsocketBuilder"

class Requests extends React.Component {
    // private ws: WebSocketBuilder

    public constructor(props: any) {
        super(props)

        // this.ws = new WebSocketBuilder(`${ServerURL}`, () => {

        // })

        // this.ws.on('connection', (socket: any) => {
        //     // tslint:disable:no-console
        //     console.log("TEST")
        //   });

        // this.ws.connect()
    }

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
                        Request Music
                    </span>
                </div>
                <div style={{ display: "grid", gridRowGap: ".25rem", gridTemplateColumns: "2fr 4fr 1fr", padding: "1rem .5rem 1rem .5rem" }}>
                    <span>Name:</span>
                    <input style={{ borderRadius: "2rem", width: "100%" }} type="text" />
                    <button style={{ borderRadius: "2rem", width: "100%"}}>Send Request</button>
                    <span>Request:</span>
                    <input style={{ borderRadius: "2rem", width: "100%" }} type="text" />
                    <button style={{ borderRadius: "2rem", width: "100%"}}>Send Request</button>
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

export default Requests;
