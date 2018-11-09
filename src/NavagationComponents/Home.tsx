import * as React from "react";

import ShadowBoxing from "shadowboxing"
import coachella from "../coachella.jpg"
import COLORSCHEME from "../ColorScheme"
import ContentCard from "../ContentCard";
import kdsuLogo from "../kdsuLogo.png"
// import ServerURL from "../ServerURL"
// import About from "./About";


class Home extends React.Component {

    public render() {
        const componentWrapperStyle: React.CSSProperties = {
            backgroundColor: COLORSCHEME.primaryLight,
            width: "100%",
        }

        return (
            <div style={componentWrapperStyle}>
                <div style={{ position: "relative", height: "90vh", overflow: "hidden", width: "100%" }}>
                    <img src={coachella} style={{ height: "90vh", overflow: "hidden", minWidth: "100%", maxWidth: "auto" }} />
                    <div style={{ top: "25%", left: "50%", position: "absolute", transform: "translate(-50%, -25%)" }} >
                        <ShadowBoxing level={4} style={{ alignItems: "center", borderRadius: "2.5rem", justifyContent: "space-evenly", display: "flex", backgroundColor: COLORSCHEME.primary, height: "18vw" }}>
                            <span style={{ color: COLORSCHEME.primaryText, fontSize: "7vw", paddingTop: "1vw" }}>
                                KDSU
                            </span>
                            <img alt="logo" height="1336" src={kdsuLogo} width="1136" style={{ display: "inline-block", maxHeight: 1136, maxWidth: 1336, height: "auto", width: "15vw" }} />
                        </ShadowBoxing>
                        <ShadowBoxing level={4} style={{ alignItems: "center", borderRadius: "2.5rem", justifyContent: "center", display: "flex", flexFlow: "row wrap", backgroundColor: COLORSCHEME.secondary, marginTop: "1rem", padding: "1rem" }}>
                            <div style={{ color: COLORSCHEME.secondaryText, fontWeight: "bold", textAlign: "center", width: "100%" }}>
                                Listen Live
                            </div>
                            <div style={{ display: "flex", justifyContent: "center", paddingTop: ".5rem", width: "100%" }}>
                                <audio controls={true} src={`http://kdsu.net:8000/live`} />
                            </div>
                        </ShadowBoxing>
                    </div>
                </div>
                {/* <About /> */}
                <ContentCard ContentCardBottomLinks={[{ external: false, route: "/contact", text: "Contact" }]} title="About">
                    <div>
                        KDSU is the <span style={{ fontWeight: "bold" }}> student lead </span> radio organization at Dakota State University.

                        We do live events, on campus radio, as well as online radio.
                    </div>
                </ContentCard>
            </div>
        );
    }
}

export default Home;
