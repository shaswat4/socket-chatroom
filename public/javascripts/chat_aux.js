let current_chat = null;
let current_chat_messages = null;
let logged_user = null;
var messages = $("ul#chat-main-body-messages");

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
          span.attr("data-name", value.name);
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
 * sets sends data in form of attributes
 * to input tag
 */
function setMessageInputAtrributes(target, object) {
  Object.keys(object).forEach((attr_name) => {
    let name = _.kebabCase(attr_name);
    let value = object[attr_name];
    target.attr(name, value);
  });
}

/**
 *
 * @param {*} target - current tag
 * @returns attribute data object
 */
function getAttributesFromTag(target) {
  let group_id = target.attr("data-group-id");
  let type = target.attr("data-chat-type");
  let name = target.attr("data-name");

  let object = {
    group_id: group_id,
    type: type,
    user_id: null,
    name: name,
  };

  if (type == "user") {
    let user_id = target.attr("data-user-id");
    object["user_id"] = user_id;
  }

  return object;
}

function getMessageFromAPI(group_id) {
  let temp = null;
  $.ajax({
    url: "chat/getMessage/new",
    type: "POST",
    data: { group_id: group_id },
    success: function (data) {
      // Handle the response from the server
      // renderChatMain(data);

      current_chat_messages = data;
      renderMessages(data);

      // let ele = $(".chat-main input#input");
      // setMessageInputAtrributes(ele, object);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Handle errors
      console.error("Error: " + textStatus + " - " + errorThrown);
    },
  });

  return temp;
}

/**
 * handles clicks on active chat items
 */
function clickOnActiveChatItem(e) {
  let target = $(this);
  let object = getAttributesFromTag(target);
  p(object);
  current_chat = object;

  getMessageFromAPI(current_chat.group_id);
}

async function clickOnsearchItem(e) {
  let target = $(this);
  let object = getAttributesFromTag(target);
  current_chat = object;

  //p(object)

  if (current_chat.type == "user") {
    await $.ajax({
      url: "chat/searchGroupID",
      type: "POST",
      data: { user_id: current_chat.user_id },
      success: function (data) {
        // Handle the response from the server
        //renderChatMain(data);

        p(data);
        current_chat.group_id = data.group_id;
        p(current_chat);

        let ele = $(".chat-main input#input");
        setMessageInputAtrributes(ele, object);
      },
      error: function (jqXHR, textStatus, errorThrown) {
        // Handle errors
        console.error("Error: " + textStatus + " - " + errorThrown);
      },
    }).catch((ele) => {});
  }

  p(current_chat);

  if (current_chat.group_id != null) {
    getMessageFromAPI(current_chat.group_id);
  } else {
    let temp = {
      header: {
        name: current_chat.name,
      },
      chats: [],
    };

    renderMessages(temp);
  }
}

function simpleMsgRender(msg) {
  var item = document.createElement("li");
  if ("<%= user.username %>" == msg.username) {
    item.className = "self";
  } else {
    item.className = "other";
  }
  item.innerHTML = "<span>" + msg.username + "</span> : " + msg.message;
  console.log(item);
  messages.append(item);
  window.scrollTo(0, document.body.scrollHeight);
}

function renderMessages(data) {
  p(data);

  let header = "<h1>" + data.header.name + "</h1>";
  $(".chat-main-header").html(header);

  messages.empty();

  if (data.chats.length > 0) {
    for (let index = 0; index < data.chats.length; index++) {
      const chat = data.chats[index];
      simpleMsgRender(chat);
    }
  }
}
