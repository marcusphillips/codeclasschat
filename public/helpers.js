$(function(){
  var global = (function(){return this;}());

  var host = "codeclasschat.herokuapp.com";
  //var host = "localhost:1982"; // dev

  // The time (in milliseconds) of the last message we received.
  var since = 0;

  global.helpers = {

    sendMessage: function(message) {
      console.log('sending message...');
      $.ajax("http://" + host + "/messages/create", {
        dataType: "jsonp",
        data: {text: message}
      });
    },

    renderMessage: function(text) {
      console.log('rendering message...', text);
      var $messages = $('.messages').length ? $('.messages') : $('<ol class="messages"/>').appendTo(document.body);
      $('<li class="message"/>').html($('<span class="text"/>').text(text)).prependTo($messages);
    },

    // Goes to the server to get all undisplayed messages and passes each one to the rendering helper
    fetchNewMessages: function(callback) {
      console.log('fetching messages...');
      $.ajax("http://" + host + "/messages", {
        dataType: "jsonp",
        data: {since: since},
        success: function (result) {
          // Update the value of the `since` variable so we don't get
          // the same messages back again in the future.
          result.messages.length && (since = result.messages[result.messages.length - 1].time);
          var messageTexts = [];
          $.each(result.messages, function(which, message){
            messageTexts.push(message.text);
          });
          callback(messageTexts);
        }
      });
    },
  };

});
