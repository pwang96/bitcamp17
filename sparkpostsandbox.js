var key = "1b3a8429baf9f5a6b5fb656fa33884004bb76d2b"
  , SparkPost = require('sparkpost')
  , client = new SparkPost(key)
  , options = {
    timezone: 'America/New_York'
  };

// Callback
client.inboundDomains.get('scrapbookit.me', function(err, data) {
  if (err) {
    console.log('Whoops! Something went wrong');
    console.log(err);
  } else {
    console.log('Congrats you can use our client library!');
    console.log(data);
  }
});

// Callback
client.webhooks.list(function(err, data) {
  if (err) {
    console.log('Whoops! Something went wrong');
    console.log(err);
  } else {
    console.log('Congrats you can use our client library!');
    console.log(data);
  }
});

// Callback
client.webhooks.get('9676c720-1c1f-11e7-8835-8b943b52aa83', options, function(err, data) {
  if (err) {
    console.log('Whoops! Something went wrong');
    console.log(err);
  } else {
    console.log('Congrats you can use our client library!');
    console.log(data);
  }
});