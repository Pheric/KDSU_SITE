// export default class WebSocketBuilder {
//     private handleOnMessage: () => void;
//     private url: string
//     private ws: WebSocket

//     constructor(url: string, handleOnMessage: () => void) {
//         this.handleOnMessage = handleOnMessage;
//         this.url = url
//         this.ws = this.buildWebSocket()

//         this.handleOnClose = this.handleOnClose.bind(this)
//     }

//     handleOnClose() {
//         this.ws = this.buildWebSocket()
//     }

//     private buildWebSocket(): WebSocket {
//         const ws = new WebSocket(this.url)

//         ws.onclose = this.handleOnClose
//         ws.onmessage = this.handleOnMessage

//         return ws
//     }
// }