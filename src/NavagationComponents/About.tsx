import * as React from "react";

import ContentCard from "../ContentCard"

class About extends React.Component {

    public render() {
        return (
            <ContentCard ContentCardBottomLinks={[{ external: false, route: "/contact", text: "Contact" }]} title="About">
                <div style={{ fontSize: "5vh" }}>
                    <div>
                        KDSU is the <span style={{ fontWeight: "bold" }}> student led </span> radio organization at Dakota State University.
                    </div>
                    <div style={{ marginTop: "1rem" }}>
                        We primarily apply our music passions, graphic design skills, and software development skills towards providing on campus events such as school dances, promoting events and creating logos, and maintaining internet radio at kdsu.net
                    </div>
                    <div style={{ marginTop: "1rem" }}>
                        KDSU meets <span style={{ fontWeight: "bold" }}>every week on Friday during the DSU school year at the KDSU booth</span> (next to the game area) in the Trojan Center, from <span style={{ fontWeight: "bold" }}>1PM to 2PM.</span>
                    </div>
                </div>
            </ContentCard>
        )
    }
}

export default About;
