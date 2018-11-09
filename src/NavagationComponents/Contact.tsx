import * as React from "react";

import COLORSCHEME from "../ColorScheme"

import ContentCard from "../ContentCard"

import { faFacebookSquare } from "@fortawesome/free-brands-svg-icons"
import { faEnvelopeSquare } from "@fortawesome/pro-regular-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

class Contact extends React.Component {

    public render() {
        return (
            <ContentCard title="Contact">
                <a href="https://www.facebook.com/groups/619447018076152/" target="_blank" style={{ display: "flex", flex: 1, justifyContent: "center" }} >
                    <FontAwesomeIcon icon={faFacebookSquare} style={{ color: COLORSCHEME.secondaryText, fontSize: "300%", margin: "5%" }} />
                </a>
                <a href="mailto:kdsu@dsu.edu" target="_blank" style={{ display: "flex", flex: 1, justifyContent: "center" }} >
                    <FontAwesomeIcon icon={faEnvelopeSquare} style={{ color: COLORSCHEME.secondaryText, fontSize: "300%", margin: "5%" }} />
                </a>
            </ContentCard>
        );
    }
}

export default Contact;
