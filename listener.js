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


// event listener for new emails
var ref = firebase.database().ref('inbound');
ref.on('child_added', snapshot => {

    snapshot.forEach(item => {

        var msg = item.val().msys.relay_message;

        // message was not an email
        if (!msg) {
            return;
        }

        var author = msg.friendly_from;
        var subject = msg.content.subject.toLowerCase();
        var date = new Date().toLocaleString();
        var html = msg.content.html;
        var raw_data = msg.content.email_rfc822;

        // subject line contains "about"
        if (subject.indexOf("about") != -1) {
            // query data from firebase
            console.log('Data requested from ' + author + ' about ' + subject);
            queryData(subject, author);

        // subject line doesn't contain "about"
        } else {
            // push data into firebase
            console.log('Saving new data from ' + author + ' about ' + subject);
            pushData(subject, author, date, html, raw_data);
        }
    });

    }, err => {
    console.log('Error getting snapshot.', err)
})

// push data to firebase
function pushData(subject, author, date, html, raw_data) {

    var img_data = null;

    // inline image exists
    if(html.indexOf("<img src=") != -1) {
        img_data = getImageData(raw_data, html);
    }

    ref = firebase.database().ref(subject);
    ref.once("value", function(snapshot) {
        // event already exists, append to end
        if (snapshot.val()) {
          var size = snapshot.val().size + 1;

          firebase.database().ref(subject).update({size: size});
          firebase.database().ref(subject).update({last_update: date});
          firebase.database().ref(subject + '/' + size).set({
              author: author,
              date: date,
              html: html
          });

          if(img_data) {
            firebase.database().ref(subject + "/" + size + "/image").set({
              name: img_data[0],
              type: img_data[1],
              data: img_data[2]
            });
          }

        // event doesn't exist
        } else {
          size = 1;
          firebase.database().ref(subject).set({
            date_created: date,
            last_update: date,
            size: size,
            1: {
                author: author,
                date: date,
                html: html
            }
          });

          if(img_data) {
            firebase.database().ref(subject + "/1/image").set({
              name: img_data[0],
              type: img_data[1],
              data: img_data[2]
            });
          }
        }
    });



}

// get data about specified subject and send about email
function queryData(subject, recipient) {
    subject = subject.slice(5, subject.length).trim();
    ref = firebase.database().ref(subject)

    ref.once("value")
    .then(function(snapshot) {
        var size = snapshot.child('size').val();

        if(size) {
          var str = ""
          var inline_image_data = [];
          for (var i = 1; i <= size; i++) {
              var html = snapshot.child(i + "/html").val();
              var author = snapshot.child(i +"/author").val();
              var date = snapshot.child(i +"/date").val();


              str = format1 + author + format2 + date + format3 + html + format4 + str;

              if(snapshot.child(i + "/image").val()) {
                inline_image_data.push({
                  name: snapshot.child(i + "/image").val().name,
                  type: snapshot.child(i + "/image").val().type,
                  data: snapshot.child(i + "/image").val().data
                });
              }
          }

          console.log(str);

          sendAboutEmail(recipient, str, author, subject, inline_image_data);

        } else {
          sendAboutNotFound(subject, recipient);
        }
    });
}

function sendConfirmation(recipient) {
    sparky.transmissions.send({
        options: {
        sandbox: false
        },
        content: {
        from: 'postmaster@scrapbookit.me',
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

// send about email
function sendAboutEmail(recipient, html, author, subject, inline_image_data) {
    sparky.transmissions.send({
        options: {
          sandbox: false
        },
        content: {
          from: 'postmaster@scrapbookit.me',
          subject: 'Here\'s the ' + subject + ' scrapbook!',
          html: html,
          inline_images: inline_image_data
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

// send subject not found email
function sendAboutNotFound(subject, recipient) {
    sparky.transmissions.send({
        options: {
            sandbox: false
        },
        content: {
            from: 'postmaster@scrapbookit.me',
            subject: 'No info here...',
            html: 'Currently, there is no information about ' + subject + ' :(. <br>\
            Be the <strong>first</strong> one to add something! Change your subject line to \
            just "' + subject + '"!'
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

// gets image name, type and data
function getImageData(raw_data, html) {
  var name, type, data;

  var start_index = html.indexOf("cid:") + "cid:".length;
  var stop_index = html.indexOf("width=");
  name = html.substring(start_index, stop_index - 2);

  start_index = raw_data.indexOf("Content-Type: image") + "Content-Type: ".length;
  stop_index = raw_data.indexOf(";", start_index);
  type = raw_data.substring(start_index, stop_index);

  start_index = raw_data.lastIndexOf(name);
  start_index = start_index + name.length;
  data = raw_data.substring(start_index);
  data = data.replace("\n", "");

  return [name, type, data];
}

var format1 = `<div class="page" style="padding: 10px 5px 5px 5px; line-height: 1.5;">
  <div class="divider" style="height: 1px; width: 100%; background-color: black;"></div>
  <div class="author" style="color: black !important; text-decoration: none !important; font-size: larger; font-weight: bold;">`
var format2 = `</div>
  <div class="time" style="color: gray;">`
var format3 = `</div>
  <div class="content" style="margin: 5px 0px; color: black;">`
var format4 = `
  </div>
</div>`
