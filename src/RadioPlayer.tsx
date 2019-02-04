import * as React from "react"

import styled from 'styled-components'
import serverURL from "./ServerURL";


interface IRadioPlayerState {
    songTitle: string
    songConnection?: WebSocket
}

const wsConnectURL: string = `ws://${serverURL}/ws/radio-player`

class RadioPlayer extends React.Component<{}, IRadioPlayerState> {
    private _ismounted: boolean = false

    public constructor(props: {}) {
        super(props)

        this.handleRadioPlayerWebsocketError = this.handleRadioPlayerWebsocketError.bind(this)
        this.getNewRadioPlayerWebsocket = this.getNewRadioPlayerWebsocket.bind(this)
        this.handleRadioPlayerWebsocketClose = this.handleRadioPlayerWebsocketClose.bind(this)
        this.handleRadioPlayerWebsocketMessage = this.handleRadioPlayerWebsocketMessage.bind(this)

        this.state = {
            songTitle: "",
            songConnection: undefined,
        }

        // Initialize the WebSocket so that the song title can stay updated
        this.getNewRadioPlayerWebsocket()
    }

    public componentDidMount() {
        this._ismounted = true;
    }

    public componentWillUnmount() {
        this._ismounted = false;
    }

    public render() {
        const WrappingDiv = styled.div`
            display: grid;
            grid-template-areas: "radio" "song";
            grid-template-columns: 1fr;
            grid-template-rows: 1fr 1fr;`

        let TitleSpan

        // TitleSpan is the span representing the area below the audio tag,
        // it would be a song title if the connection was established (state.songTitle !== ""),
        // or a loading icon if the connection is being established (state.songTitle === "")
        if (this.state.songTitle !== "")
            TitleSpan = styled.span`
                grid-area: song;
                place-self: center;
                font-size: 1rem;
                word-wrap: break-word;`
        else
            TitleSpan = styled.span`
                grid-area: song;
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

        return (
                <WrappingDiv>
                    <audio controls={true} src={`http://kdsu.net:8000/live`} style={{ gridArea: "radio" }} />
                    {(this.state.songTitle !== "") ? (
                        <TitleSpan>
                            {this.state.songTitle}
                        </TitleSpan>
                    ) : (
                        <TitleSpan />
                    )}
                </WrappingDiv>
            )
    }

    private getNewRadioPlayerWebsocket(): WebSocket {
        let radioPlayerWebsocket: WebSocket = new WebSocket(wsConnectURL)

        radioPlayerWebsocket.onerror = this.handleRadioPlayerWebsocketError

        radioPlayerWebsocket.onopen = () => {
            if (radioPlayerWebsocket.readyState === 0) {
                radioPlayerWebsocket.onclose = this.handleRadioPlayerWebsocketClose
                radioPlayerWebsocket.onmessage = this.handleRadioPlayerWebsocketMessage

                this.setState({
                    songConnection: radioPlayerWebsocket,
                })
            }
        }

        return radioPlayerWebsocket
    }

    private handleRadioPlayerWebsocketError() {
        if (this._ismounted)
            this.getNewRadioPlayerWebsocket()
    }

    private handleRadioPlayerWebsocketMessage(message: MessageEvent) {
        if (this._ismounted) {
            this.setState({
                songTitle: message.data,
            })
        }
    }

    handleRadioPlayerWebsocketClose() {
        if (this._ismounted) {
            if (this.state.songTitle !== "") {
                this.setState({
                    songConnection: this.getNewRadioPlayerWebsocket(),
                })
            } else {
                this.setState({
                    songConnection: this.getNewRadioPlayerWebsocket(),
                    songTitle: "Reconnecting 🔌"
                })
            }
        }
    }
}

export default RadioPlayer;