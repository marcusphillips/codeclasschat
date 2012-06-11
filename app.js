var path = require("path"),
    strata = require("strata"),
    redirect = strata.redirect;

strata.use(strata.commonLogger);
strata.use(strata.contentType, "text/html");
strata.use(strata.file, path.join(__dirname, "public"), "index.html");
strata.use(strata.jsonp);

// An array of message strings that have been posted to this chat.
var history = [];

// The number of events to keep around in the chat history.
var maxHistory = 100;
var injectMessageAfter = 15000;
var timeout;

var addMessage = function(text){
  history.push({
    time: new Date().getTime(),
    text: text
  });

  timeout && clearTimeout(timeout);
  timeout = setTimeout(function(){
    addMessage('No new messages in '+(injectMessageAfter/1000).toFixed()+' seconds. Here\'s a random number instead: '+(Math.random()*10).toFixed());
  }, injectMessageAfter);

  while (history.length > maxHistory) { history.shift(); }
};

addMessage('The chat server has booted!');

// GET /messages/create?text=:text
strata.get("/messages/create", function (env, callback) {
  strata.Request(env).params(function (err, params) {
    var content, status;
    if (params.text) {
      addMessage(params.text);
      content = {message: "Message added"};
      status = 201;
    } else {
      content = {message: "You must provide a text parameter."};
      status = 400;
    }
    callback(status, {"Content-Type": "application/json"}, JSON.stringify(content));
  });
});

// GET /messages?since=:milliseconds
strata.get("/messages", function (env, callback) {
  strata.Request(env).params(function (err, params) {
    var since = parseInt(params.since);
    // If no "since" was given, just return the last 100 messages.
    callback(200, {"Content-Type": "application/json"}, JSON.stringify({
      messages: isNaN(since) ? history.slice(-10) : history.filter(function (message) {
        return since < message.time;
      })
    }));
  });
});

module.exports = strata.app;
