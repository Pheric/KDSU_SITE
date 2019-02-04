# KDSU Website

## Development Gotcha's

Riley:

"These are things that either tripped me up during development or wasted copius amounts of time"

### Scenarios

- When using the development server (`npm run start` which runs the front-end and hot-reloads on changes at `localhost:3000` by default) during work on the front-end and trying to make requests to the back-end (`localhost:xxxx` where `xxxx` is some port other than 3000) Chrome blocks HTTP requests from the front-end to the back-end because of the CORS (Cross-Origin Resource Sharing ) policy

    ![Chrome CORS Error](https://raw.githubusercontent.com/the-rileyj/KDSU_SITE/master/read_me_images/chrome_cors_error.png "Chrome CORS Error")

    This is a common occurence when trying to have the front-end get content from a newly developed endpoint locally on the back-end API. Fortunetely there is an easy fix, just run the back-end server with the `-d` flag. This will attach a middleware to the router which will handle setting the `Access-Control-Allow-Origin` header on the response to `*`, which will satiate Chrome. If you would like to gain a further understanding into this issue and the security implications behind it, [read this](https://medium.com/@baphemot/understanding-cors-18ad6b478e2b).

- You are testing media queries and they are not working properly when you resize the window using chrome developer tools

    Take the following scenario for example, you are testing the following css and trying to get the media query to work properly:

    ![Media Query CSS](https://raw.githubusercontent.com/the-rileyj/KDSU_SITE/master/read_me_images/media_query_css.png "Media Query CSS")

    Which lives inside of the following [styled component]():

    ![Media Query CSS In Styled Component](https://raw.githubusercontent.com/the-rileyj/KDSU_SITE/master/read_me_images/media_query_css_in_styled_component.png "Media Query CSS In Styled Component")

    That styled component is rendered as follows:

    ![Styled Component Rendering](https://raw.githubusercontent.com/the-rileyj/KDSU_SITE/master/read_me_images/styled_component_rendered.png "Styled Component Rendering")

    With the given context, one would expect the grid items to shift from a grid layout with a single column with three rows (an image, text, and text) to a grid layout with two columns and two rows as soon as the with exceeds `910px`, however, this does not seem to be the case:

    ![Full Sized Window](https://raw.githubusercontent.com/the-rileyj/KDSU_SITE/master/read_me_images/chrome_full_size.png "Full Sized Window")

    As we can see, the window width has exceeded `910px` and the grid layout is still a single column with the picture occupying the first row, when we were expecting the picture on the left and text on the right.

    The solution is to either resize your whole window or change the view from the standard desktop view to a mobile view by clicking the little phone icon in the top left of the Chrome developer tools:

    ![Mobile Window](https://raw.githubusercontent.com/the-rileyj/KDSU_SITE/master/read_me_images/chrome_mobile.png "Mobile Window")