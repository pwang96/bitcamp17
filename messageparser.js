var SparkPost = require('sparkpost');
var sparky = new SparkPost("1b3a8429baf9f5a6b5fb656fa33884004bb76d2b"); // SPARKPOST_API_KEY

var f = function(req) {
    // get all the data from the json in the POST body
    var msg1 = req[0].msys.relay_message;
    var author = msg1.friendly_from;
    var subject = msg1.content.subject;
    var date = msg1.content.headers[4].Date;
    var text = msg1.content.text;
    var html = msg1.content.html;
    
    // differentiate between about and info
    if (subject.indexOf("about") != -1) {
        // subject line contains "about"
        // query data from firebase
    } else {
        // subject line doesn't contain "about"
        // push data into firebase
    }
};





sparky.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: 'testing@sparkpostbox.com',
      subject: 'Hello, World!',
      html:'<html><body><p>Testing SparkPost - the world\'s most awesomest email service!</p></body></html>'
    },
    recipients: [
      {address: 'looper222@gmail.com'}
    ]
  })
  .then(data => {
    console.log('Woohoo! You just sent your first mailing!');
    console.log(data);
  })
  .catch(err => {
    console.log('Whoops! Something went wrong');
    console.log(err);
  });