import * as React from "react"

import styled from 'styled-components'

import serverURL from "./ServerURL";
import SongTitleUpdater from "./SongTitleUpdater"



class RadioPlayer extends React.Component {
    public render() {
        const WrappingDiv = styled.div`
            display: grid;
            grid-template-areas: "radio" "song";
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;`

        return (
                <WrappingDiv>
                    <audio controls={true} src={`http://kdsu.net:8000/live`} style={{ gridArea: "radio" }} />
                    <SongTitleUpdater />
                </WrappingDiv>
            )
    }
}

export default RadioPlayer;