package main

import (
	"net/http"

	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.GET("/", func(c *gin.Context) { http.ServeFile(c.Writer, c.Request, "./index.html") })
	r.GET("/favicon.ico", func(g *gin.Context) { http.ServeFile(g.Writer, g.Request, "/static/img/favicon.ico") })
	r.Use(static.Serve("/static", static.LocalFile("static/", true)))
	r.Run(":6969")
}
