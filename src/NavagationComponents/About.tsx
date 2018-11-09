import * as React from "react";

import ContentCard from "../ContentCard"

class About extends React.Component {

    public render() {
        return (
            <ContentCard ContentCardBottomLinks={[{ external: false, route: "/contact", text: "Contact" }]} title="About">
                <div>
                    KDSU is the <span style={{ fontWeight: "bold" }}> student lead </span> radio organization at Dakota State University.

                    We do live events, on campus radio, as well as online radio.
                </div>
            </ContentCard>
        )
    }
}

export default About;
