var socket = io();

var messages = document.getElementById("messages");
var form = document.getElementById("form");
var input = document.getElementById("input");
// const username = "<%= username %>";
// const active_user_id = 

//search and main chat body loading 
$(document).ready(function () {
  function loadChatMain(value) {
    // for body header
    $.ajax({
      url: "chat/getHeader",
      type: "POST",
      data: { user_id: value },
      success: function (data) {
        // Handle the response from the server
        console.log(data);
        $(".chat-main-header").html(data);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Handle errors
        console.log("Error: " + textStatus + " - " + errorThrown);
      },
    });

    // for main body
  }

  function handleClickOnItem() {
    var value = $(this).attr("value");
    loadChatMain(value);
    console.log("Value:", value);
  }

  $(".chat-search").submit(function (e) {
    e.preventDefault();
    let a = $(".chat-search-input").val();
    console.log(a);

    $.ajax({
      url: "chat/search",
      type: "POST",
      data: { query: a },
      success: function (data) {
        // Handle the response from the server
        console.log(data);
        $(".chat-nav-body").html(data);
        $(".chat-nav-items").click(handleClickOnItem);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Handle errors
        console.log("Error: " + textStatus + " - " + errorThrown);
      },
    });
  });
});


// window.addEventListener("load", (event) => {
//   console.log("page is fully loaded");
//   socket.emit("add room", { room: "<%=title %>" });
// });

// $("document").ready(function () {
//   window.scrollTo(0, document.body.scrollHeight);
// });

//chat message 2 emitor
$("send-message-form").submit( function (e) {
  e.preventDefault();
  if (input.value) {
    socket.emit("chat message 2", {
      //room: "<%=title %>",
      message: input.value,
      //room_id: "<%= id %>",
      user_id: "<%= user_id %>",
      //username: "<%= username %>",
    });
    console.log(input.value);
    input.value = "";
  }
  //console.log("<%=title %>");
});

// function message_display(msg) {
//   console.log(msg);
//   console.log($("#msgs").length);
// }

// function createMessageHTML(data) {
//   var $msgs = $("#msgs");
//   var $lastUserDiv = $msgs.children(":last-child");
//   var $lastUserP = $lastUserDiv.children("p:first-child");

//   if ($lastUserP.text() === data.username) {
//     $lastUserDiv.append('<p class="chat">' + data.message + "</p>");
//   } else {
//     let temp = "";
//     if (username === data.username) {
//       temp = "self";
//     } else {
//       temp = "other";
//     }

//     var $newUserDiv = $(
//       '<div class="user-' +
//         data.username +
//         " " +
//         temp +
//         '">' +
//         '<p class="username">' +
//         data.username +
//         "</p>" +
//         '<p class="chat">' +
//         data.message +
//         "</p>" +
//         "</div>"
//     );
//     $msgs.append($newUserDiv);
//   }

//   window.scrollTo(0, document.body.scrollHeight);
// }



//chat group messge recievor 
socket.on("chat group message", function (msg) {
  var item = document.createElement('li');
  if (username === msg.username){
    item.className = 'self';
  }else{
    item.className = 'other';
  }
  item.innerHTML = '<span>' + msg.username + '</span> : ' + msg.message;
  messages.appendChild(item);
  window.scrollTo(0, document.body.scrollHeight);

  //message_display(msg)
  //createMessageHTML(msg);
});
