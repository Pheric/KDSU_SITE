// tslint:disable:no-console
import * as firebase from "firebase"

const MESSAGING_ID = "641790340718"
firebase.initializeApp({ messagingSenderId: MESSAGING_ID })

export function initializePush(): firebase.messaging.Messaging|undefined {
    const messaging = firebase.messaging()
    messaging
        .requestPermission()
        .then(() => {
            console.log("Have Permission")
            return messaging.getToken()
        })
        .then(token => {
            console.log("FCM Token:", token)
            // you probably want to send your new found FCM token to the
            // application server so that they can send any push
            // notification to you.
        })
        .catch(error => {
            if (error.code === "messaging/permission-blocked") {
                console.log("Please Unblock Notification Request Manually")
            } else {
                console.log("Error Occurred", error)
            }
            return undefined
        })

        return messaging
}