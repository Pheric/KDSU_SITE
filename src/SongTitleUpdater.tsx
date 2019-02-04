import * as React from "react"

import styled from 'styled-components'
import serverURL from "./ServerURL";


interface ISongTitleUpdaterState {
    songTitle: string
    songConnection?: WebSocket
}

const wsConnectURL: string = `ws://${serverURL}/ws/song-title-updater`

class SongTitleUpdater extends React.Component<{}, ISongTitleUpdaterState> {
    private _ismounted: boolean = false

    public constructor(props: {}) {
        super(props)

        this.handleSongTitleUpdatingWebsocketError = this.handleSongTitleUpdatingWebsocketError.bind(this)
        this.getNewSongTitleUpdatingWebsocket = this.getNewSongTitleUpdatingWebsocket.bind(this)
        this.handleSongTitleUpdatingPlayerWebsocketClose = this.handleSongTitleUpdatingPlayerWebsocketClose.bind(this)
        this.handleSongTitleUpdatingWebsocketMessage = this.handleSongTitleUpdatingWebsocketMessage.bind(this)

        this.state = {
            songTitle: "",
            songConnection: undefined,
        }

        // Initialize the WebSocket so that the song title can stay updated
        this.getNewSongTitleUpdatingWebsocket()
    }

    public componentDidMount() {
        this._ismounted = true;
    }

    public componentWillUnmount() {
        this._ismounted = false;
    }

    public render() {
        // Connection is established if state.songTitle !== "" because webserver will send out
        // a message on connect, even if the connection is established, the stream may not be online,
        // this will be indicated by state.songTitle being "Stream Offline 🔌"; if the connection is
        // being established state.songTitle === "" and a loading icon will be displayed
        if (this.state.songTitle === "") {
            const LoadingSpan = styled.span`
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

            return <LoadingSpan />
        }

        const SongTitleSpan = styled.span`
            grid-area: song;
            place-self: center;
            font-size: 1rem;
            word-wrap: break-word;`

        return (
            <SongTitleSpan>
                {this.state.songTitle}
            </SongTitleSpan>
        )
    }

    private getNewSongTitleUpdatingWebsocket(): WebSocket {
        let songTitleUpdatingWebsocket: WebSocket = new WebSocket(wsConnectURL)

        songTitleUpdatingWebsocket.onerror = this.handleSongTitleUpdatingWebsocketError
        songTitleUpdatingWebsocket.onmessage = this.handleSongTitleUpdatingWebsocketMessage

        songTitleUpdatingWebsocket.onopen = () => {
            songTitleUpdatingWebsocket.onclose = this.handleSongTitleUpdatingPlayerWebsocketClose

            this.setState({
                songConnection: songTitleUpdatingWebsocket,
            })
        }

        return songTitleUpdatingWebsocket
    }

    private handleSongTitleUpdatingWebsocketError() {
        if (this._ismounted)
            this.getNewSongTitleUpdatingWebsocket()
    }

    private handleSongTitleUpdatingWebsocketMessage(message: MessageEvent) {
        if (this._ismounted) {
            this.setState({
                songTitle: message.data,
            })
        }
    }

    handleSongTitleUpdatingPlayerWebsocketClose() {
        if (this._ismounted) {
            this.setState({
                songConnection: this.getNewSongTitleUpdatingWebsocket(),
                songTitle: "Reconnecting 🔌"
            })
        }
    }
}

export default SongTitleUpdater;