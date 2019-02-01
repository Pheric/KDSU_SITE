package main

import (
	"fmt"
	"log"
	"net/http"

	"google.golang.org/api/googleapi/transport"
	"google.golang.org/api/youtube/v3"
)

const dkey = ""
const channelID = "UCPkWt8nvDFvjdbctHt8FHJw"

func getUploadData(service *youtube.Service) ([]*youtube.PlaylistItem, error) {
	call := service.Channels.List("snippet,contentDetails")

	call = call.Id(channelID)

	response, err := call.Do()

	if err != nil {
		return nil, err
	}

	nid := getChannelUploadPlaylistID(response)

	fmt.Println(nid)

	ncall := service.PlaylistItems.List("snippet,contentDetails")

	ncall = ncall.PlaylistId(nid)
	ncall = ncall.MaxResults(25)

	nresponse, err := ncall.Do()

	if err != nil {
		panic(err)
	}

	for _, item := range nresponse.Items {
		fmt.Println(item.Snippet.Title)
	}

	return nil, err
}

func getChannelUploadPlaylistID(response *youtube.ChannelListResponse) string {
	return response.Items[0].ContentDetails.RelatedPlaylists.Uploads
}

func channelsListById(service *youtube.Service, part, id string) {
	call := service.Channels.List(part)
	if id != "" {
		call = call.Id(id)
	}
	response, _ := call.Do()

	nid := getChannelUploadPlaylistID(response)

	fmt.Println(nid)

	ncall := service.PlaylistItems.List("snippet,contentDetails")

	ncall = ncall.PlaylistId(nid)
	ncall = ncall.MaxResults(25)

	nresponse, err := ncall.Do()

	if err != nil {
		panic(err)
	}

	for _, item := range nresponse.Items {
		fmt.Println(item.Snippet.Title)
	}
}

func main() {
	client := &http.Client{
		Transport: &transport.APIKey{Key: dkey},
	}

	service, err := youtube.New(client)

	if err != nil {
		log.Fatalf("Error creating YouTube client: %v", err)
	}

	channelsListById(service, "snippet,contentDetails,statistics", channelID)
}
