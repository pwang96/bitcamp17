const SparkPost = require('sparkpost')
const firebase = require('firebase')
var sparky = new SparkPost("1b3a8429baf9f5a6b5fb656fa33884004bb76d2b"); // SPARKPOST_API_KEY

var config = {
    apiKey: "AIzaSyBY4j3iCU0hyp9nIanz5aEAtRK5vgeg_vU",
    authDomain: "bitcamp17.firebaseapp.com",
    databaseURL: "https://bitcamp17.firebaseio.com",
    projectId: "bitcamp17",
    storageBucket: "bitcamp17.appspot.com",
    messagingSenderId: "1024483173233"
};
firebase.initializeApp(config);

// const logger = require('./config/logger')('verbose')
// const relayParser = require('./relay_parser')

let isListening = false

var ref = firebase.database().ref('inbound');
ref.on('child_added', snapshot => {
    console.log('Recieved and Processing email')
    snapshot.forEach(item => {
        // console.log(item.val().msys)
        // console.log(item.val()) // prints out {relay_message: {content: ...}}
        // console.log(item)
        var msg1 = item.val().msys.relay_message;
        
        if (!msg1) {
            return true;
        }
        var author = msg1.friendly_from;
        var subject = msg1.content.subject.toLowerCase();
        var date = new Date().toLocaleString();
        var text = msg1.content.text;
        var html = msg1.content.html;

        if (subject.indexOf("about") != -1) {
            // subject line contains "about"
            // query data from firebase
            queryData(subject);
        } else {
            // subject line doesn't contain "about"
            // push data into firebase
            pushData(subject, author, date, text, html);
            // craft and send response
            sendConfirmation(author);
            
        }
    });

    }, err => {
    console.log('Error getting snapshot.', err)
})

function pushData(subject, author, date, text, html) {
    ref = firebase.database().ref(subject);
    var size = 0
    ref.on("value", function(snapshot) {
        if (snapshot.val() == null) {
            return
        }
        size = snapshot.val().size;
        if (typeof size == "number") {
            return
        }
    })
    console.log("SIZE: " + size)
    if (size != 0) {
        // exists already

        size = size + 1;
        var strsize = size.toString();
        firebase.database().ref(subject).update({size: size})
        firebase.database().ref(subject + '/' + size).set({
            subject: subject,
            author: author,
            date: date,
            text: text,
            html: html
            
        })
        return
    }
    
    firebase.database().ref(subject).set({
        size: 1,
        '1': {
            subject: subject,
            author: author,
            date: date,
            text: text,
            html: html
        }
    })

}

function queryData(subject) {
    subject = subject.slice(5, subject.length).trim();
    ref = firebase.database().ref(subject)
    var answer = "";

    ref.on("value")
    .then(function(snapshot) {
        var name = snapshot.child("name").val(); // {first:"Ada",last:"Lovelace"}
        var firstName = snapshot.child("name/first").val(); // "Ada"
        var lastName = snapshot.child("name").child("last").val(); // "Lovelace"
        var age = snapshot.child("age").val(); // null
    });
    var returned_data;
    ref.orderByChild("date").limitToFirst(2).on("value", function(snapshot) {
        console.log(snapshot.key);
    })

}

function sendConfirmation(recipient) {
    sparky.transmissions.send({
        options: {
        sandbox: true
        },
        content: {
        from: 'testing@sparkpostbox.com',
        subject: 'Thank you!',
        html:'<html><body><p>Your submission has been received! \n \
                Thanks for your contribution!</p></body></html>'
        },
        recipients: [
        {address: recipient}
        ]
    })
    .catch(err => {
        console.log('something went wrong');
        console.log(err);
    });
}