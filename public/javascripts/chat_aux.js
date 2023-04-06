function hello() {
  console.log("hello world");
}

function p(params) {
  console.log(params);
}

/**
 * takes json in object and 
 * string [search, active] in option
 * passes data according to option
 * displayes search and active chat list in 
 * div class chat-nav-body
 */
function displayList(object, option) {
  /**
   * binded to search function
   * takes json object containing users and groups
   * adds data-chat-type, data-group-id, data-user-id
   * displays them
   */
  function searchDisplay(object) {
    function giveUlContent(list, ul_obj, type) {
      $.each(list, function (index, value) {
        var li = $("<li>").text(value.name);
        var span = $("<span>").addClass("chat-nav-item").append(li);

        if (type == "group") {
          span.attr("data-chat-type", "group");
          span.attr("data-group-id", value.group_id);
        } else {
          span.attr("data-chat-type", "user");
          span.attr("data-user-id", value.user_id);
        }

        span.appendTo(ul_obj);
      });
      console.log(user_ul);
      return ul_obj;
    }

    let heading_tag = "#chat-nav-body";
    $(heading_tag).empty();

    //users
    var user_heading = $("<h1>").text("Users (" + object.users.length + ") :");
    $(heading_tag).append(user_heading);

    var user_ul = $("<ul>");
    giveUlContent(object.users, user_ul, "user");
    $(heading_tag).append(user_ul);

    // groups
    var group_heading = $("<h1>").text(
      "Groups (" + object.groups.length + ") :"
    );
    $(heading_tag).append(group_heading);

    var group_ul = $("<ul>");
    giveUlContent(object.groups, group_ul, "group");
    $(heading_tag).append(group_ul);
  }

  /**
   * binded to /activeChatList ajax post request
   * gets json object
   * adds data-chat-type, data-group-id, data-user-id
   * displays it
   */
  function displaChatList(object) {
    function giveUlContent(list, ul_obj) {
      $.each(list, function (index, value) {
        let li = null;
        let span = null;

        // json object is a group
        if (value.isgroup) {
          li = $("<li>").text(value.group_name);
          span = $("<span>").addClass("chat-nav-item").append(li);
          span.attr("data-chat-type", "group");
        } else {
          li = $("<li>").text(value.username);
          span = $("<span>").addClass("chat-nav-item").append(li);
          span.attr("data-chat-type", "user");
          span.attr("data-user-id", value.user_id);
        }

        span.attr("data-group-id", value.chat_group_id);
        span.appendTo(ul_obj);
      });
      return ul_obj;
    }

    let heading_tag = "#chat-nav-body";
    $(heading_tag).empty();

    var ul = $("<ul>");
    giveUlContent(object.chatList, ul);
    $(heading_tag).append(ul);
  }

  if (option == "search") {
    searchDisplay(object);
  } else {
    displaChatList(object);
  }
}

/**
 * handles clicks on active chat items 
 */
function clickOnActiveChatItem(e) {
  let group_id = $(this).attr("data-group-id");

  $.ajax({
    url: "chat/getMessage/new",
    type: "POST",
    data: { group_id: group_id },
    success: function (data) {
      // Handle the response from the server

      //renderChatMain(data);
      renderMessages(data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Handle errors
      console.error("Error: " + textStatus + " - " + errorThrown);
    },
  });
}

function renderMessages(data) {
  p(data);
}
