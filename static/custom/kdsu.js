var v = new Vue({
    el: '#app',
    data: function() {
        return {
            currentVideo: 'Trailers',
            headers: [
                {text:"Home", id:"HOME"},
                {text:"About", id:"ABOUT"},
                {text:"Podcasts", id:"PODCASTS"},
                {text:"Radio", id:"RADIO"}
            ],
            navBarHeight: 0,
            videoNames: ['The Disney Machine', 'Trailers'],
            videos: {'The Disney Machine':'QA7B_SQ9aLo', 'Trailers':'Iv7vqQGgeE4'}
        }
    },
    methods: {
        findPos: function(obj) {
            var curtop = 0;
            if (obj.offsetParent) {
                do {
                    curtop += obj.offsetTop;
                } while (obj = obj.offsetParent);
                return [curtop];
            }
        },
        navTo: function(link) {
            window.scroll(0, this.findPos(document.getElementById(link)) - 2 * this.navBarHeight);
            document.getElementById("navbar-icon").click();
        },
        navToTop: function() {
            window.scrollTo(0, 0)
        }
    },
    mounted: function() {
        this.navBarHeight = document.getElementById("kdsu-nav").clientHeight;
    }
});