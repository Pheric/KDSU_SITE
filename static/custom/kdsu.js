var v = new Vue({
    el: '#app',
    data: function() {
        return {
            headers: [
                {text:"Radio", id:"RADIO"},
                {text:"Podcasts", id:"PODCASTS"},
                {text:"About", id:"ABOUT"}
            ],
            navBarHeight: 0
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
            window.scroll(0, this.findPos(document.getElementById(link)) - this.navBarHeight);
        },
        navToTop: function() {
            window.scrollTo(0, 0)
        }
    },
    mounted: function() {
        //this.navBarHeight = document.getElementById("NAVBAR").clientHeight;
    }
});