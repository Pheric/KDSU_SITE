package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
	"time"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	uuid "github.com/satori/go.uuid"
	melody "gopkg.in/olahol/melody.v1"
)

type apiResponse struct {
	Err     string `json:"error"`
	Success bool   `json:"success"`
}

type songRequest struct {
	Link string `json:"link"`
	Name string `json:"name"`
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

func getInfo(path string) (string, error) {
	infoStruct := struct {
		password string `json:"password"`
	}{}

	fi, err := os.Open(path)

	if err != nil {
		return "", err
	}

	err = json.NewDecoder(fi).Decode(&infoStruct)

	if err != nil {
		return "", err
	}

	return infoStruct.password, nil
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
	var err error
	var password string
	var reqMaster requestMaster

	reqMaster.LastRequest = make(map[*melody.Session]time.Time)
	reqMaster.Masters = make(map[*melody.Session]bool)
	reqMaster.Requesters = newRequesters()

	password, err = getInfo("info.json")
	fmt.Println(password)

	if err != nil {
		fmt.Println(err)
		return
	}

	djSessions := make(map[string]bool)

	m := melody.New()

	m.HandleMessage(func(s *melody.Session, msg []byte) {
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
			if wsMsg.Msg == password {
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

	// api := httpRouter.Group("/api")
	// {
	// 	api.GET("")
	// }

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

		if loginStruct.Password != password {
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

	httpRouter.GET("/ws/", func(c *gin.Context) {
		fmt.Println("Websocket connection")
		m.HandleRequest(c.Writer, c.Request)
	})

	httpRouter.NoRoute(func(c *gin.Context) {
		http.ServeFile(c.Writer, c.Request, "./static/index.html")
	})

	log.Fatal(httpRouter.Run(":80"))
}
