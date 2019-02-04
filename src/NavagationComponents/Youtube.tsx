import * as React from "react";

import axios, { AxiosResponse } from "axios"
import styled from "styled-components"
import ShadowBoxing from "shadowboxing"

import COLORSCHEME from "../ColorScheme"
import ContentCard from "../ContentCard"
import YoutubeVideo from "../Types/YoutubeVideo"
import YoutubeVideoCard from "../YoutubeVideoCard"
import YoutubeVideoPlayer from "../YoutubeVideoPlayer"
import serverURL from "../ServerURL";


interface IYoutubeState {
    searchQuery: string
    selectedIndex: number
    selectedID: string
    youtubeVideos: YoutubeVideo[]
}

class Youtube extends React.Component<{}, IYoutubeState> {
    private YoutubeComponentDiv = styled.div`
        display: grid;
        grid-row-gap: 1rem;
        grid-template-areas: "player" "videoSection";
        grid-template-columns: 1fr;
        width: 100%;
    `

    private readonly PlayerDiv = styled.div`
        grid-area: player;
        width: 100%;
    `

    private readonly SearchInput = styled.input`
        grid-area: search;
        background-color: ${COLORSCHEME.primary};
        border: none;
        caret-color: ${COLORSCHEME.primaryText}
        color: ${COLORSCHEME.primaryText};
        width: 100%;

        &:focus, &:focus{
            outline: none;
        }

        &::placeholder {
            color: ${COLORSCHEME.primaryText};
            opacity: 1;
        }
    `

    private readonly VideosDiv = styled.div`
        display: grid;
        grid-area: videos;
        grid-row-gap: 2rem;
        width: 100%;
    `

    private readonly LoadingDiv = styled.div`
        place-self: center;

        @keyframes loadingRing {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

        &:after {
            content: " ";
            display: block;
            width: 5vh;
            height: 5vh;
            margin: 1px;
            border-radius: 50%;
            border: 5px solid;
            border-color: #000 transparent #000 transparent;
            animation: loadingRing 1.2s linear infinite;
        }`

    public constructor(props: any) {
        super(props)

        this.getYoutubeVideos = this.getYoutubeVideos.bind(this)
        this.handleSearchChange = this.handleSearchChange.bind(this)
        this.selectVideo = this.selectVideo.bind(this)

        this.state = {
            selectedIndex: 0,
            selectedID: "",
            searchQuery: "",
            youtubeVideos: []
        }

        this.getYoutubeVideos()
    }

    public render() {
        return (
            <ContentCard ContentCardBottomLinks={[{ external: true, route: "https://www.youtube.com/channel/UCPkWt8nvDFvjdbctHt8FHJw", text: "Subscribe to Our Channel" }]} JustifyContent="center" title="KDSU Youtube Content">
                {(() => {
                    if (this.state.youtubeVideos.length === 0)
                        return <this.LoadingDiv />

                    return (
                        <this.YoutubeComponentDiv>
                            <this.PlayerDiv>
                                {((youtubeVideo: YoutubeVideo) => {
                                    return <YoutubeVideoPlayer
                                        description={youtubeVideo.snippet.description}
                                        id={youtubeVideo.contentDetails.videoId}
                                        publishTime={new Date(youtubeVideo.snippet.publishedAt)}
                                        title={youtubeVideo.snippet.title}
                                    />
                                })(this.state.youtubeVideos[this.state.selectedIndex])}
                            </this.PlayerDiv>
                            <ShadowBoxing level={12} shadowHorizontalOffset={4} style={{ backgroundColor: COLORSCHEME.primary, gridArea: "videoSection", width: "100%" }}>
                                <div style={{ padding: "1rem" }}>
                                    <div style={{ display: "grid", gridGap: "1rem", gridTemplateAreas: '"search" "videos"' }}>
                                        <this.SearchInput onChange={this.handleSearchChange} placeholder="search for a video..." type="text" value={this.state.searchQuery} />
                                        <this.VideosDiv>
                                            {this.state.youtubeVideos.filter(
                                                (youtubeVideo: YoutubeVideo) => youtubeVideo.snippet.title.toLowerCase().includes(this.state.searchQuery.toLowerCase())
                                            ).map((youtubeVideo: YoutubeVideo, index: number) => {
                                                return (
                                                    <YoutubeVideoCard clickHandler={this.selectVideo} key={index} selected={youtubeVideo.id === this.state.selectedID} video={youtubeVideo} />
                                                )
                                            })}
                                        </this.VideosDiv>
                                    </div>
                                </div>
                            </ShadowBoxing>
                        </this.YoutubeComponentDiv>
                    )
                })()}
            </ContentCard>
        )
    }

    private async getYoutubeVideos() {
        const self = this
        let youtubeVideosResponse: AxiosResponse<YoutubeVideo[]>
        let err = true

        while (err) {
            try {
                youtubeVideosResponse = await axios.get(`http://${serverURL}/api/youtube/uploads`)

                self.setState({
                    selectedID: youtubeVideosResponse.data[0].id,
                    youtubeVideos: youtubeVideosResponse.data.map((youtubeVideo: YoutubeVideo, index: number) => {
                        youtubeVideo.originalIndex = index

                        return youtubeVideo
                    })
                })

                return
            } catch (responseErr) {
                console.log(responseErr)
            }

            // Sleep for two seconds then try again
            await new Promise(() => setTimeout(() => 2000))
        }
    }

    private handleSearchChange(event: React.SyntheticEvent<HTMLInputElement>) {
        this.setState({ searchQuery: event.currentTarget.value });
    }

    private selectVideo(youtubeVideo: YoutubeVideo) {
        this.setState({
            selectedID: youtubeVideo.id,
            selectedIndex: youtubeVideo.originalIndex,
        })

        window.scrollTo(0, 0)
    }
}

export default Youtube;
