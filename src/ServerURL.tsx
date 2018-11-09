const serverURL = window.location.port === "3000" ? `http://localhost:${process.env.REACT_APP_SERVER_PORT}` : window.location.origin

export default serverURL