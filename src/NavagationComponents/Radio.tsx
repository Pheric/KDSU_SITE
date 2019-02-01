import * as React from "react";

import ContentCard from "../ContentCard"
import RadioPlayer from "../RadioPlayer"


class Radio extends React.Component {
    public render() {
        return (
            <ContentCard ContentCardBottomLinks={[{ external: false, route: "/contact", text: "Contact" }]} JustifyContent="center" title="Live Radio">
                <RadioPlayer />
            </ContentCard>
        )
    }
}

export default Radio;
