import * as React from "react";

import ContentCard from "../ContentCard"

// import ReactPlayer from 'react-player'

// import ReactJWPlayer from 'react-jw-player';

// import ServerURL from "../ServerURL"

class Radio extends React.Component {

    public render() {
        return (
            <ContentCard ContentCardBottomLinks={[{ external: false, route: "/contact", text: "Contact" }]} JustifyContent="center" title="Live Radio">
                <div>
                    <audio controls={true} src={`http://kdsu.net:8000/live`} />
                    {/* <audio controls={true} src={`http://kdsu.net:8000/live`} /> */}
                    {/* <ReactPlayer url='http://18.217.97.56:8000/live.m3u'  /> */}
                </div>
            </ContentCard>
        )
    }
}

export default Radio;
