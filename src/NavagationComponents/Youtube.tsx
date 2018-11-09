import * as React from "react";

import ContentCard from "../ContentCard"

// import Select from 'react-select'
interface IYoutubeState {
    selectedOption: string
}

interface IYoutubeSelectOption {
    value: string,
    label: string
}

class Youtube extends React.Component<{}, IYoutubeState> {
    private youtubeSelectOptions: IYoutubeSelectOption[] = [
        {
            label: "The Disney Machine",
            value: "QA7B_SQ9aLo",
        },
        {
            label: "Trailers",
            value: "Iv7vqQGgeE4",
        },
    ]

    public constructor(props: any) {
        super(props)

        this.handleChange = this.handleChange.bind(this)

        this.state = {
            selectedOption: this.youtubeSelectOptions[0].value
        }
    }

    public render() {
        return (
            <ContentCard ContentCardBottomLinks={[{ external: true, route: "https://www.youtube.com/channel/UCPkWt8nvDFvjdbctHt8FHJw", text: "Subscribe to Our Channel" }]} JustifyContent="center" title="KDSU Youtube Content">
                <div style={{ height: "100%" }}>
                    <iframe style={{ width: "100%", height: "100%", border: 0 }} src={`https://www.youtube.com/embed/${this.state.selectedOption}`} />
                    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
                        <select onChange={this.handleChange} style={{width: "100%"}}>
                            {this.youtubeSelectOptions.map((youtubeVideo, index) => {
                                return <option key={index} value={youtubeVideo.value}>{youtubeVideo.label}</option>
                            })}
                        </select>
                        {/* <Select isClearable={false} onChange={this.handleChange} options={this.youtubeSelectOptions} value={this.state.selectedOption} /> */}
                    </div>
                </div>
            </ContentCard>
        )
    }

    private handleChange (event: React.SyntheticEvent<HTMLSelectElement>) {
        this.setState({ selectedOption: event.currentTarget.value })
    }

    // private handleChange (selectedOption: IYoutubeSelectOption) {
    //     this.setState({ selectedOption })
    // }
}

export default Youtube;
