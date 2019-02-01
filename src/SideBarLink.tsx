import * as React from "react";

import { Link } from "react-router-dom";

import COLORSCHEME from "./ColorScheme";

interface ISideBarLinkProps {
    action: () => void
    normal: React.CSSProperties
    hover: React.CSSProperties
    route: string
}

interface ISideBarLinkState {
    hover: boolean
}

class SideBarLink extends React.Component<ISideBarLinkProps, ISideBarLinkState> {
    public constructor(props: ISideBarLinkProps) {
        super(props)

        this.handlePointerEnter = this.handlePointerEnter.bind(this)
        this.handlePointerLeave = this.handlePointerLeave.bind(this)

        this.state = {
            hover: false,
        }
    }

    public render() {
        let linkStyle: React.CSSProperties = {
            alignItems: "center",
            color: COLORSCHEME.primaryText,
            display: "flex",
            fontSize: "3rem",
            flex: 1,
            justifyContent: "center",
            textAlign: "center",
            textDecoration: "none",
            ...this.props.normal,
        }

        if (this.state.hover) {
            linkStyle = { ...linkStyle, ...this.props.hover }
        }

        return (
            <Link onPointerUp={this.props.action} onPointerEnter={this.handlePointerEnter} onPointerLeave={this.handlePointerLeave} style={linkStyle} to={this.props.route}>
                <span>
                    {this.props.children}
                </span>
            </Link>
        );
    }

    private handlePointerEnter() {
        this.setState({
            hover: true
        })
    }

    private handlePointerLeave() {
        this.setState({
            hover: false
        })
    }
}

export default SideBarLink;
