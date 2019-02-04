export interface YoutubeVideo {
    contentDetails: ContentDetails;
    etag:           string;
    id:             string;
    kind:           string;
    snippet:        Snippet;
    // This is for our own use, we will set this when enumerating the list
    originalIndex:  number;
}

export interface ContentDetails {
    videoId:          string;
    videoPublishedAt: string;
}

export interface Snippet {
    channelId:    string;
    channelTitle: string;
    description:  string;
    playlistId:   string;
    publishedAt:  string;
    resourceId:   ResourceID;
    thumbnails:   Thumbnails;
    title:        string;
    position?:    number;
}

export interface ResourceID {
    kind:    string;
    videoId: string;
}

export interface Thumbnails {
    default:  Default;
    high:     Default;
    maxres:   Default;
    medium:   Default;
    standard: Default;
}

export interface Default {
    height: number;
    url:    string;
    width:  number;
}

export default YoutubeVideo