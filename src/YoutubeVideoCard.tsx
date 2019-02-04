// Even though we do not reference react directly, this code depends
// on having it to run properly and will throw a Reference error
// claiming that React is not defined without this
import * as React from "react";

import styled, { css } from "styled-components"

import COLORSCHEME from "./ColorScheme"
import ShadowBoxing from "shadowboxing"
import YoutubeVideo from "./Types/YoutubeVideo";

interface YoutubePlayerProps {
    clickHandler: (youtubeVideo: YoutubeVideo) => void
    selected: boolean
    video: YoutubeVideo
}

const VideoCardContentDiv = styled.div`
    display: grid;
    height: 100%;
    padding: 1rem;

    grid-row-gap: 1rem;
    grid-template-areas: "thumbnail" "title" "description";
    grid-template-columns: 1fr;
    grid-template-rows: 1fr auto auto;
    justify-items: center;

    @media all and (min-width: 910px) {
        grid-gap: 1rem 1rem;
        grid-template-areas: "thumbnail title"
                            "thumbnail description";
        grid-template-columns: 1fr 3fr;
        grid-template-rows: 1fr 3fr;
        justify-items: stretch;
    }
`

const shadowboxingStyle: React.CSSProperties = {
    backgroundColor: COLORSCHEME.secondary,
    width: "100%"
}


function clickWrapper(youtubeVideo: YoutubeVideo, clickHandler: (youtubeVideo: YoutubeVideo) => void, selected: boolean): () => void {
    return () => {
        if (!selected) {
            clickHandler(youtubeVideo)
        }
    }
}

const YoutubeVideoPlayer = (props: YoutubePlayerProps) => {
    
    return (
        <div onClick={clickWrapper(props.video, props.clickHandler, props.selected)}>
            <ShadowBoxing level={4} style={ (props.selected) ? {border: `dotted ${COLORSCHEME.primaryDark}`, ...shadowboxingStyle} : {cursor: "pointer", ...shadowboxingStyle}}>
                <VideoCardContentDiv>
                    <img src={props.video.snippet.thumbnails.medium.url} style={{ gridArea: "thumbnail", height: "auto", width: "100%" }} />
                    <span style={{ gridArea: "title", textAlign: "center" }}>
                        {props.video.snippet.title}
                    </span>
                    <span style={{ gridArea: "description", fontSize: "1.5rem", textAlign: "center" }}>
                        {props.video.snippet.description}
                    </span>
                </VideoCardContentDiv>
            </ShadowBoxing>
        </div>
    )
}

export default YoutubeVideoPlayer