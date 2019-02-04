import * as React from "react"

import styled from "styled-components"
import ShadowBoxing from "shadowboxing"

import COLORSCHEME from "./ColorScheme";

interface YoutubePlayerProps {
    id: string
    description: string
    publishTime: Date
    title: string
}

const YoutubeVideoPlayerDiv = styled.div`
    display: grid;
    color: ${COLORSCHEME.primaryText};
    grid-template-areas: "youtubeVideo" "title" "publishTime" "description";
    grid-template-columns: 1fr;
`

const YoutubeVideoPlayer = (props: YoutubePlayerProps) => {
    return (
        <ShadowBoxing level={4} style={{ backgroundColor: COLORSCHEME.primary, height: "100%", width: "100%" }}>
            <div style={{ padding: "1rem" }}>
                <YoutubeVideoPlayerDiv>
                    <div style={{gridArea: "youtubeVideo", height: 0, paddingBottom: "56.25%",  position: "relative" }}>
                        <iframe allowFullScreen style={{ border: 0, height: "100%", left: 0, position: "absolute", top: 0, width: "100%" }} src={`https://www.youtube.com/embed/${props.id}`} />
                    </div>
                    <span style={{gridArea: "title"}}>
                        {props.title}
                    </span>
                    <span style={{borderBottom: `solid ${COLORSCHEME.primaryText}`, gridArea: "publishTime", marginBottom: "1rem", width: "100%"}}>
                        Published on: {props.publishTime.toDateString()}
                    </span>
                    <span style={{gridArea: "description"}}>
                        {props.description}
                    </span>
                </YoutubeVideoPlayerDiv>
            </div>
        </ShadowBoxing>
    )
}

export default YoutubeVideoPlayer