import * as React from "react";

import About from "./NavagationComponents/About"
import Contact from "./NavagationComponents/Contact"
import Home from "./NavagationComponents/Home"
import Radio from "./NavagationComponents/Radio"
// import Requests from "./NavagationComponents/Requests";
import Youtube from "./NavagationComponents/Youtube";

import COLORSCHEME from "./ColorScheme"

import kdsuLogo from "./kdsuLogo.png";

import { faBars, faTimesCircle } from "@fortawesome/pro-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Route, Switch } from 'react-router'
import { Link } from "react-router-dom"
import SideBarLink from "./SideBarLink";

interface IAppState {
    amHome: boolean
    sideBarExtended: boolean
}

interface ISideBarLink {
    route: string
    text: string
}

interface IRouteItem {
    Component: typeof React.Component
    Route: string
}

const routingList: IRouteItem[] = [
    { Route: "/about", Component: About },
    { Route: "/contact", Component: Contact },
    { Route: "/radio", Component: Radio },
    { Route: "/youtube", Component: Youtube },
    // { Route: "/requests", Component: Requests },
]

class App extends React.Component<{}, IAppState> {
    private sideBarLinks: ISideBarLink[] = [
        { route: "/", text: "Home" },
        { route: "/about", text: "About" },
        { route: "/contact", text: "Contact" },
        { route: "/radio", text: "Radio" },
        { route: "/youtube", text: "Youtube/Podcasts" },
        // { route: "/requests", text: "Requests" },
    ]
    public constructor(props: any) {
        super(props)

        this.closeSideBar = this.closeSideBar.bind(this)
        this.openSideBar = this.openSideBar.bind(this)
        this.toggleSideBar = this.toggleSideBar.bind(this)

        this.state = {
            amHome: false,
            sideBarExtended: false
        }
    }

    public render() {
        const sideNavigationStyle: React.CSSProperties = {
            backgroundColor: COLORSCHEME.primaryLight,
            height: "100%",
            justifyItems: "center",
            left: 0,
            overflowX: "hidden",
            overflowY: "hidden",
            position: "fixed",
            top: 0,
            transition: "0.25s",
            width: this.state.sideBarExtended ? "100%" : 0,
            zIndex: 1,
        }

        const sideBarLinksContainerStyle: React.CSSProperties = {
            display: "grid",
            gridTemplate: "auto / 1fr",
            height: "90vh",
            width: "100%",
        }

        const navYSize = 90 / this.sideBarLinks.length;

        return (
            <div className="App" style={{ backgroundColor: COLORSCHEME.primaryLight, minHeight: "100vh", }}>
                <header className="App-header" style={{ alignItems: "center", backgroundColor: COLORSCHEME.primary, display: "flex", justifyContent: "space-between", height: "10vh" }}>
                    <a onPointerUp={this.toggleSideBar}>
                        <FontAwesomeIcon icon={faBars} style={{ color: COLORSCHEME.primaryText, cursor: "pointer", fontSize: "6vh", margin: "2vh" }} />
                    </a>
                    <Switch>
                        {routingList.map((routingItem, index) => <Route key={index} path={routingItem.Route} render={this.homeHeader} />)}
                    </Switch>
                    <FontAwesomeIcon icon={faBars} style={{ color: "rgba(0,0,0,0)", fontSize: "6vh", margin: "2vh" }} />
                </header>
                <div id="mySidenav" className="sidenav" style={sideNavigationStyle}>
                    <div onClick={this.closeSideBar} style={{ alignItems: "center", backgroundColor: COLORSCHEME.primary, color: COLORSCHEME.primaryText, display: "flex", height: "10vh", justifyContent: "center", width: "100%" }}>
                        <a onPointerUp={this.toggleSideBar} style={{ cursor: "pointer", display: "flex", justifyContent: "center", width: "100%", }}>
                            <FontAwesomeIcon icon={faTimesCircle} style={{ color: COLORSCHEME.primaryText, fontSize: "6vh", margin: "2vh" }} />
                        </a>
                    </div>
                    <div style={sideBarLinksContainerStyle}>
                        {this.sideBarLinks.map((sideBarLink, index) => (
                                <SideBarLink action={this.closeSideBar} hover={{ backgroundColor: COLORSCHEME.primaryDark }} key={index} normal={{ backgroundColor: COLORSCHEME.primaryLight }} route={sideBarLink.route} navYSize={navYSize} >
                                    {sideBarLink.text}
                                </SideBarLink>
                            )
                        )}
                    </div>
                </div>
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Switch>
                        <Route exact={true} path="/" component={Home} />
                        {routingList.map((routingItem, index) => <Route key={index} path={routingItem.Route} component={routingItem.Component} />)}
                        <Route component={Home} />
                    </Switch>
                </div>
            </div>
        );
    }

    public closeSideBar() {
        this.setState({
            sideBarExtended: false
        })
    }

    public homeHeader (props: any) {
        return (
            <Link to="/" style={{ alignItems: "center", display: "flex", height: "100%", padding: "2%", textDecoration: "none", width: "auto", }}>
                <span style={{ color: COLORSCHEME.primaryText, fontSize: "6vh", paddingRight: "2vh", paddingTop: "1vh" }}>
                    KDSU
                </span>
                <img alt="logo" height="1336" src={kdsuLogo} width="1136" style={{ display: "inline-block", maxHeight: 1136, maxWidth: 1336, height: "100%", width: "auto" }} />
            </Link>
        )
    }

    public noHomeHeader() {
        return <div />
    }

    public openSideBar() {
        this.setState({
            sideBarExtended: true
        })
    }

    public toggleSideBar(event: React.PointerEvent<HTMLAnchorElement>) {
        this.setState({
            sideBarExtended: !this.state.sideBarExtended
        })

        event.preventDefault()
        event.stopPropagation()
    }
}

export default App;
