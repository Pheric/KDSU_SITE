import * as React from "react";

import COLORSCHEME from "./ColorScheme"

import { Link } from "react-router-dom"

import ShadowBoxing from "shadowboxing"

export interface IContentCardBottomLink {
    external: boolean
    route: string
    text: string
}

interface IContentCardSettings {
    ContentCardBottomLinks: IContentCardBottomLink[]
    ContentPadding: string
    JustifyContent: string
}

interface IContentCardProps {
    ContentCardBottomLinks?: IContentCardBottomLink[]
    ContentPadding?: string
    JustifyContent?: string
    title: string
}

class ContentCard extends React.Component<IContentCardProps> {
    private ContentCardSettings: IContentCardSettings

    public constructor(props: IContentCardProps) {
        super(props)

        this.ContentCardSettings = {
            ContentCardBottomLinks: [],
            ContentPadding: "3%",
            JustifyContent: "flex-start"
        }

        if (this.props.ContentCardBottomLinks !== undefined) {
            this.ContentCardSettings.ContentCardBottomLinks = this.props.ContentCardBottomLinks
        }

        if (this.props.ContentPadding !== undefined) {
            this.ContentCardSettings.ContentPadding = this.props.ContentPadding
        }

        if (this.props.JustifyContent !== undefined) {
            this.ContentCardSettings.JustifyContent = this.props.JustifyContent
        }
    }

    public render() {
        const componentWrapperStyle: React.CSSProperties = {
            backgroundColor: COLORSCHEME.secondaryLight,
            display: "block",
            margin: "5%",
            maxWidth: "100%",
            minHeight: "auto",
            width: "90%",
        }

        return (
            <ShadowBoxing level={4} style={componentWrapperStyle}>
                <div style={{ backgroundColor: COLORSCHEME.secondary, display: "flex", padding: this.ContentCardSettings.ContentPadding, justifyContent: "flex-start" }}>
                    <span style={{ color: COLORSCHEME.secondaryText, fontSize: "4rem", }} >
                        {this.props.title}
                    </span>
                </div>
                <div style={{ alignItems: "center", color: COLORSCHEME.secondaryText, display: "flex", fontSize: "2rem", justifyContent: this.ContentCardSettings.JustifyContent, padding: this.ContentCardSettings.ContentPadding, }}>
                    {this.props.children}
                </div>
                {
                    this.ContentCardSettings.ContentCardBottomLinks.map((bottomLink, index) => {
                        if (bottomLink.external) {
                            return (
                                <div key={index} style={{ backgroundColor: COLORSCHEME.secondaryDark, display: "flex", padding: this.ContentCardSettings.ContentPadding, justifyContent: "flex-start" }}>
                                    <a href={bottomLink.route} style={{ textDecoration: "none", width: "100%", }} target="_blank" >
                                        <span style={{ color: COLORSCHEME.secondaryText, fontSize: "4rem", }} >
                                            {bottomLink.text}
                                        </span>
                                    </a>
                                </div>
                            )
                        }

                        return (
                            <div key={index} style={{ backgroundColor: COLORSCHEME.secondaryDark, display: "flex", padding: this.ContentCardSettings.ContentPadding, justifyContent: "flex-start" }}>
                                <Link to={bottomLink.route} style={{ textDecoration: "none", width: "100%", }}>
                                    <span style={{ color: COLORSCHEME.secondaryText, fontSize: "4rem", }} >
                                        {bottomLink.text}
                                    </span>
                                </Link>
                            </div>
                        )
                    })
                }
            </ShadowBoxing>
        );
    }
}

export default ContentCard;
