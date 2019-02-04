package main

import (
	"context"
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
	"sync"
	"time"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/pkg/errors"
	uuid "github.com/satori/go.uuid"
	"google.golang.org/api/googleapi/transport"
	"google.golang.org/api/youtube/v3"
	melody "gopkg.in/olahol/melody.v1"
)

const (
	icecastEndpoint  = "http://icecast-stream:8000/status-json.xsl"
	uploadPlaylistID = "UUPkWt8nvDFvjdbctHt8FHJw"
)

var (
	youtubeService *youtube.Service
)

type apiResponse struct {
	Err     string `json:"error"`
	Success bool   `json:"success"`
}

type infoStruct struct {
	Password      string `json:"password"`
	YoutubeAPIKey string `json:"youtube"`
}

type rjFileSystem struct {
	http.FileSystem
	root    string
	indexes bool
}

type requester struct {
	Approved      bool
	Name, Request string
	WS            *melody.Session
}

type requesters struct {
	Requesters  map[string]requester
	RequesterID map[*melody.Session]string // Maps the  ws for the requester to the request ID, WS->ID
}

type radioSongTitleHandler struct {
	wsHandler *melody.Melody
	mutex     *sync.Mutex
	Title     string `json:"title"`
}

type UploadsHandler struct {
	lastupdate time.Time
	mutex      *sync.Mutex
	service    *youtube.Service
	uploads    *[]*youtube.PlaylistItem
}

func newUploadsHandler(service *youtube.Service) (*UploadsHandler, error) {
	uploads := &UploadsHandler{
		mutex:   &sync.Mutex{},
		service: service,
	}

	uploadsList, err := getUploadData(service)

	uploads.uploads = &uploadsList
	uploads.lastupdate = time.Now()

	return uploads, err
}

// Used for handling how often data is updated, for accessing the
// upload information directly, it is much better to just access the field
func (uh *UploadsHandler) refreshUploadData() error {
	uh.mutex.Lock()
	defer uh.mutex.Unlock()

	uploadsList, err := getUploadData(uh.service)

	if err != nil {
		uh.uploads = &uploadsList
	}

	return err
}

// Used for handling how often data is updated, for accessing the
// upload information directly, it is much better to just access the field
func (uh *UploadsHandler) getUploadData() *[]*youtube.PlaylistItem {
	if time.Now().Sub(uh.lastupdate) > time.Minute {
		err := uh.refreshUploadData()

		if err != nil {
			fmt.Println(err)
		}
	}

	uh.mutex.Lock()
	defer uh.mutex.Unlock()

	return uh.uploads
}

type songRequest struct {
	Link string `json:"link"`
	Name string `json:"name"`
}

func getNewRadioSongTitleHandler() *radioSongTitleHandler {
	nRSTH := &radioSongTitleHandler{
		wsHandler: melody.New(),
		mutex:     &sync.Mutex{},
		Title:     "dest",
	}

	nRSTH.wsHandler.HandleConnect(func(s *melody.Session) {
		s.Write([]byte(nRSTH.getSongTitle()))
	})

	go nRSTH.handleUpdatingSongTitle()

	return nRSTH
}

func (rSTH *radioSongTitleHandler) getSongTitle() string {
	rSTH.mutex.Lock()

	defer rSTH.mutex.Unlock()

	return rSTH.Title
}

func (rSTH *radioSongTitleHandler) setSongTitle(songTitle string) {
	rSTH.mutex.Lock()

	defer rSTH.mutex.Unlock()

	rSTH.Title = songTitle
}

func (rSTH *radioSongTitleHandler) handleUpdatingSongTitle() {
	var (
		err             error
		icecastRequest  *http.Request
		icecastResponse *http.Response
		requestContext  context.Context
		cancelFunc      context.CancelFunc
	)

	icecastResponseJSON := struct {
		Icestats struct {
			Admin              string `json:"admin"`
			Host               string `json:"host"`
			Location           string `json:"location"`
			ServerID           string `json:"server_id"`
			ServerStart        string `json:"server_start"`
			ServerStartIso8601 string `json:"server_start_iso8601"`
			Source             struct {
				AudioInfo          string      `json:"audio_info"`
				Bitrate            int64       `json:"bitrate"`
				Genre              string      `json:"genre"`
				IceBitrate         int64       `json:"ice-bitrate"`
				IceChannels        int64       `json:"ice-channels"`
				IceSamplerate      int64       `json:"ice-samplerate"`
				ListenerPeak       int64       `json:"listener_peak"`
				Listeners          int64       `json:"listeners"`
				Listenurl          string      `json:"listenurl"`
				ServerDescription  string      `json:"server_description"`
				ServerName         string      `json:"server_name"`
				ServerType         string      `json:"server_type"`
				ServerURL          string      `json:"server_url"`
				StreamStart        string      `json:"stream_start"`
				StreamStartIso8601 string      `json:"stream_start_iso8601"`
				Title              string      `json:"title"`
				Dummy              interface{} `json:"dummy"`
			} `json:"source"`
		} `json:"icestats"`
	}{}

	responseErrorChannel := make(chan error)

	for {
		requestContext, cancelFunc = context.WithDeadline(context.Background(), time.Now().Add(5*time.Second))

		go func() {
			icecastRequest, err = http.NewRequest("GET", icecastEndpoint, nil)

			if err != nil {
				responseErrorChannel <- errors.Wrap(err, "could not create request")
				return
			}

			icecastRequest = icecastRequest.WithContext(requestContext)

			icecastResponse, err = http.DefaultClient.Do(icecastRequest)

			if err != nil {
				responseErrorChannel <- errors.Wrap(err, "error in icecast request")
				return
			}

			defer icecastResponse.Body.Close()

			responseErrorChannel <- json.NewDecoder(icecastResponse.Body).Decode(&icecastResponseJSON)
		}()

		select {
		case <-requestContext.Done():
			err = requestContext.Err()

			if err != nil {
				fmt.Println("Context Done Err:", err)
			}
		case err = <-responseErrorChannel:
			if err != nil {
				fmt.Println("Response Err:", err)
			} else {
				newSongTitle := icecastResponseJSON.Icestats.Source.Title

				if newSongTitle != "" {
					rSTH.setSongTitle(newSongTitle)
				} else {
					rSTH.setSongTitle("Stream Offline 🔌")
				}
			}
		}

		cancelFunc()
		time.Sleep(2 * time.Second)
	}
}

func newRequesters() *requesters {
	var r requesters

	r.Requesters = make(map[string]requester)
	r.RequesterID = make(map[*melody.Session]string)

	return &r
}

func (r *requesters) addRequester(name string, ws *melody.Session) {
	var uid string

	if r.RequesterID[ws] != "" {
		uid = r.RequesterID[ws]
	} else {
		uid = getUUID()
		r.RequesterID[ws] = uid
	}

	requester, _ := r.Requesters[uid]

	requester.WS = ws
	requester.Name = name
	requester.Approved = false

	r.Requesters[uid] = requester
}

func (r *requesters) approveRequest(ID string) {
	reqer, exists := r.Requesters[ID]

	if !exists {
		return
	}

	reqer.Approved = true

	r.Requesters[ID] = reqer
}

func (r *requesters) removeRequest(ID string) {
	reqer, exists := r.Requesters[ID]

	if !exists {
		return
	}

	reqer.Request = ""
	reqer.Approved = false

	r.Requesters[ID] = reqer
}

func (r *requesters) checkRequesterID(ID string) bool {
	_, exists := r.Requesters[ID]
	return exists
}

func (r *requesters) checkRequesterWS(ws *melody.Session) bool {
	return r.RequesterID[ws] != ""
}

func (r *requesters) addRequest(ID string, ws *melody.Session) error {

	if ID == "" {
		ID = r.RequesterID[ws]

		if ID == "" {
			return errors.New("Cannot add request")
		}
	} else {
		_, exists := r.Requesters[ID]

		if !exists {
			return errors.New("Cannot add request, user does not exist")
		}
	}

	reqer, _ := r.Requesters[ID]

	reqer.Approved = false

	r.Requesters[ID] = reqer

	return nil
}

type requestMaster struct {
	Masters     map[*melody.Session]bool      // DJ ws sessions
	Requesters  *requesters                   // Handles the names of the ws users
	LastRequest map[*melody.Session]time.Time // Handles the last ws request period
}

type responseMsg struct {
	Error    bool   `json:"error"`
	Response string `json:"response"`
	Type     string `json:"type"`
}

func getUploadData(service *youtube.Service) ([]*youtube.PlaylistItem, error) {
	const (
		// Number of times to retry for any given request to the API
		maxRetryAttempts = 5
		// Maximum results per page
		resultsPerPage int64 = 1
	)

	// Initialize variables here instead of in the loop so that they
	// they are not created and garbage collected unnessarily (this
	// is performace issue, though this is not a performace intensive
	// application, it is just good practice to do this when possible)
	var (
		attempt             = 0
		err                 error
		playlistAPIResponse *youtube.PlaylistItemListResponse
	)

	// The list of upload items we will be returning
	uploadItems := make([]*youtube.PlaylistItem, 0)

	getUploadsCall := service.PlaylistItems.List("snippet,contentDetails").PlaylistId(uploadPlaylistID).MaxResults(resultsPerPage)

	// Need to cast resultsSeen and totalResults to int64 to work more smoothly with the results from the youtube API
	for resultsSeen, totalResults := int64(0), int64(1); resultsSeen < totalResults; resultsSeen += resultsPerPage {
		// We need to supply the next page token to get new results
		if resultsSeen != 0 {
			getUploadsCall = getUploadsCall.PageToken(playlistAPIResponse.NextPageToken)
		}

		for attempt, err = 0, errors.New("dummy error"); attempt < maxRetryAttempts && err != nil; attempt++ {
			playlistAPIResponse, err = getUploadsCall.Do()
		}

		if err != nil {
			return nil, err
		}

		// if totalResults is 1 its value has not been updated yet,
		// even if the total results is actually 1, this will do no harm
		if totalResults == 1 {
			totalResults = playlistAPIResponse.PageInfo.TotalResults
		}

		uploadItems = append(uploadItems, playlistAPIResponse.Items...)
	}

	return uploadItems, err
}

// RjServe returns a middleware handler that serves static files in the given directory.
func RjServe(urlPrefix string, fs static.ServeFileSystem) gin.HandlerFunc {
	fileserver := http.FileServer(fs)

	if urlPrefix != "" {
		fileserver = http.StripPrefix(urlPrefix, fileserver)
	}

	return func(c *gin.Context) {
		if fs.Exists(urlPrefix, c.Request.URL.Path) {

			fileserver.ServeHTTP(c.Writer, c.Request)
			c.Abort()
		}
	}
}

// RjServe returns a middleware handler that serves static files in the given directory.
func RjGeneralFileServer(urlPrefix string, fs static.ServeFileSystem) gin.HandlerFunc {
	fileserver := http.FileServer(fs)

	if urlPrefix != "" {
		fileserver = http.StripPrefix(urlPrefix, fileserver)
	}

	return func(c *gin.Context) {
		if fs.Exists(urlPrefix, c.Request.URL.Path) {
			fileserver.ServeHTTP(c.Writer, c.Request)
			c.Abort()
		}
	}
}

func (l *rjFileSystem) Exists(prefix string, filepath string) bool {
	if p := strings.TrimPrefix(filepath, prefix); len(p) < len(filepath) {
		name := path.Join(l.root, p)
		_, err := os.Stat(name)
		if err != nil {
			return false
		}

		return true
	}
	return false
}

func NewRjFileSystem(root string) *rjFileSystem {
	return &rjFileSystem{
		FileSystem: gin.Dir(root, true),
		root:       root,
		indexes:    true,
	}
}

func getInfo(path string) (infoStruct, error) {
	var info infoStruct

	fi, err := os.Open(path)

	if err != nil {
		return info, err
	}

	err = json.NewDecoder(fi).Decode(&info)

	if err != nil {
		return info, err
	}

	return info, nil
}

func getUUID() string {
	var err error
	var uid uuid.UUID

	for uid, err = uuid.NewV4(); err != nil; {
		uid, err = uuid.NewV4()
	}

	return uid.String()
}

func wsResponse(s *melody.Session, err bool, response, Type string) {
	bytes, _ := json.Marshal(responseMsg{err, response, Type})

	s.Write(bytes)
}

func main() {
	var (
		err       error
		info      infoStruct
		reqMaster = requestMaster{
			LastRequest: make(map[*melody.Session]time.Time),
			Masters:     make(map[*melody.Session]bool),
			Requesters:  newRequesters(),
		}
	)

	debug := flag.Bool("d", false, "Sets debugging mode, Cross-Origin Resource Sharing policy won't discriminate against the request origin (\"Access-Control-Allow-Origin\" header is \"*\")")

	flag.Parse()

	info, err = getInfo("info.json")

	if err != nil {
		panic(err)
	}

	client := &http.Client{
		Transport: &transport.APIKey{Key: info.YoutubeAPIKey},
	}

	youtubeService, err = youtube.New(client)

	if err != nil {
		panic(err)
	}

	uploads, err := newUploadsHandler(youtubeService)

	if err != nil {
		panic(err)
	}

	djSessions := make(map[string]bool)

	requestsWebsocket := melody.New()

	requestsWebsocket.HandleMessage(func(s *melody.Session, msg []byte) {
		defer func() {
			reqMaster.LastRequest[s] = time.Now()
		}()

		wsMsg := struct {
			Msg  string `json:"msg"`
			Type string `json:"type"`
			Uuid string `json:"uuid"`
		}{}

		// Handle DDOS, general spamming
		if reqMaster.LastRequest[s] != (time.Time{}) {
			if time.Now().Before(reqMaster.LastRequest[s].Add(2 * time.Second)) {
				wsResponse(s, true, "Requests sent too often, chill out.", "error")
				return
			}
		}

		err := json.Unmarshal(msg, &wsMsg)

		if err != nil {
			wsResponse(s, true, "Could not parse JSON message.", "error")
			return
		}

		if wsMsg.Uuid != "" {
			if djSessions[wsMsg.Uuid] && !reqMaster.Masters[s] {
				reqMaster.Masters[s] = true
			}
		}

		switch wsMsg.Type {

		case "approval":
			if reqMaster.Masters[s] { // Jerks will hang here
				reqMaster.Requesters.approveRequest(wsMsg.Msg)

				wsResponse(reqMaster.Requesters.Requesters[wsMsg.Msg].WS, false, "Request has been approved!", "approval")
				for ws := range reqMaster.Masters {
					wsResponse(ws, false, wsMsg.Msg, "approval")
				}
			}
		case "deny":
			if reqMaster.Masters[s] { // Jerks will hang here
				reqMaster.Requesters.removeRequest(wsMsg.Msg)

				wsResponse(reqMaster.Requesters.Requesters[wsMsg.Msg].WS, false, "Request has been denied.", "deny")
				for ws := range reqMaster.Masters {
					wsResponse(ws, false, wsMsg.Msg, "deny")
				}
			}
		case "auth":
			reqMaster.Requesters.addRequester(wsMsg.Msg, s)

			wsResponse(s, false, "Name has been updated.", "update")
		case "login":
			if wsMsg.Msg == info.Password {
				reqMaster.Masters[s] = true
				wsResponse(s, false, "You are now logged in.", "update")
			} else {
				wsResponse(s, true, "Bad Login.", "error")
			}
		case "request":
			if reqMaster.Requesters.RequesterID[s] == "" {
				wsResponse(s, true, "Need a name to make a song request.", "error")
				return
			}

			if wsMsg.Msg == "" {
				wsResponse(s, true, "Song request cannot be blank.", "error")
				return
			}

			wsResponse(s, false, "Request pending approval.", "update")

			reqMaster.Requesters.addRequest(wsMsg.Msg, s)

			for ws := range reqMaster.Masters { // Returns the song and the requester as the type
				wsResponse(ws, false, wsMsg.Msg, reqMaster.Requesters.RequesterID[ws])
			}
		default:
			wsResponse(s, true, "Could not parse JSON message type.", "error")
		}
	})

	httpRouter := gin.Default()

	httpRouter.Use(RjServe("/", NewRjFileSystem("./static/")))

	httpRouter.POST("/login", func(c *gin.Context) {
		loginStruct := struct {
			Password string `json:"password"`
		}{}

		err := json.NewDecoder(c.Request.Body).Decode(&loginStruct)

		if err != nil {
			c.JSON(400, gin.H{
				"error":   true,
				"message": "Bad request, could not parse JSON.",
			})
			return
		}

		if loginStruct.Password != info.Password {
			c.JSON(400, gin.H{
				"error":   true,
				"message": "Bad login.",
			})
			return
		}

		uid := getUUID()

		djSessions[uid] = true

		c.JSON(200, gin.H{
			"error":   false,
			"message": uid,
		})
	})

	httpRouter.GET("/ws/requests", func(c *gin.Context) {
		fmt.Println("Websocket connection")
		requestsWebsocket.HandleRequest(c.Writer, c.Request)
	})

	radioSongHandler := getNewRadioSongTitleHandler()

	httpRouter.GET("/ws/radio-player", func(c *gin.Context) {
		radioSongHandler.wsHandler.HandleRequest(c.Writer, c.Request)
	})

	api := httpRouter.Group("/api")

	if *debug {
		api.Use(func(c *gin.Context) {
			c.Writer.Header().Set("Access-Control-Allow-Origin", "*")

			c.Next()
		})
	}

	api.GET("/youtube/uploads", func(c *gin.Context) {
		c.JSON(200, uploads.getUploadData())
	})

	httpRouter.NoRoute(func(c *gin.Context) {
		http.ServeFile(c.Writer, c.Request, "./static/index.html")
	})

	// config := cors.DefaultConfig()
	// config.AllowOrigins = []string{"*"}
	// config.AllowOrigins == []string{"http://google.com", "http://facebook.com"}

	// httpRouter.Use(cors.New(config))

	log.Fatal(httpRouter.Run(":8001"))
}
