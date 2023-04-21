let current_chat = null;
let current_chat_messages = null;
let logged_user = null;
var messages = $("ul#chat-main-body-messages");
var socket = io();
let current_message = null;
let test = null;

function hello() {
  console.log("hello world");
}

function p(params) {
  console.log(params);
}

function getActiveChat() {
  $.ajax({
    url: "chat/activeChatList",
    type: "POST",
    //data: { user_id: value },
    success: function (data) {
      // Handle the response from the server
      displayList(data, "active");
      $("span.chat-nav-item").click(clickOnActiveChatItem);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Handle errors
      console.error("Error: " + textStatus + " - " + errorThrown);
    },
  });
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

function getDropdownHTML(  ) {
  
  let menu = `
  <div class="message-dropdown dropdown" style="display:inline;">
    <svg class="message-menu dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
    </svg>

    <ul class="dropdown-menu">
      <li class="dropdown-item edit">Edit</li>
      <li class="dropdown-item delete" >Delete</li>
    </ul>
  </div>
  `

  // let download = 
  // `
  // `

  return menu;
}

function simpleMsgRender(msg) {
  let isFile = !Boolean(msg.message);

  let item = document.createElement("li");
  let menu = "";
  if (logged_user.username == msg.username) {
    item.className = "self";
    menu = getDropdownHTML();
  } else {
    item.className = "other";
  }

  item.innerHTML = menu;

  if (isFile) {
    item.innerHTML += `
    <div class="message-body" style="display:inline;" >
      <span class="message-user" > ${msg.username} :</span> 
      <span class="message-content"> ${msg.file_name} </span>
    </div>
    <svg class="file-download" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
    </svg>
    `;

    item.setAttribute("data-type", "file");
    item.setAttribute("data-file-path", msg.file_path);
    item.setAttribute("data-file-name", msg.file_name);

  } else {
    item.innerHTML += 
    `
    <div class="message-body" style="display:inline;" >
      <span class="message-user" > ${msg.username} :</span> 
      <span class="message-content"> ${msg.message} </span>
    </div>
    `;
    item.setAttribute("data-type", "message");
  }

  item.setAttribute("data-message-id", msg.id);
  item.setAttribute("data-group-id", msg.Chat_Group_id);
  item.setAttribute("style", "list-style:none;");
  item.setAttribute("class", "message-item");

  console.log(item);

  messages.append(item);
  window.scrollTo(0, document.body.scrollHeight);
}

/**
 * 
 * @param {*} msg
 * obselete 
 */
function simpleFileDownloadRendrer(msg) {
  var item = document.createElement("li");
  let menu = "";
  if (logged_user.username == msg.username) {
    item.className = "self";
    menu = getDropdownHTML();
  } else {
    item.className = "other";
  }

  item.innerHTML = menu +
  `
    <span> ${msg.username} </span>: ${msg.file_name} 
    <svg class="file-download" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-download" viewBox="0 0 16 16">
    <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
    <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
    </svg>
  `;

  item.setAttribute("data-type", "file");
  item.setAttribute("data-file-path", msg.file_path);
  item.setAttribute("data-file-name", msg.file_name);
  item.setAttribute("data-message-id", msg.id );
  item.setAttribute("data-group-id", msg.Chat_Group_id);
  item.setAttribute("style", "list-style:none;");
  item.setAttribute("class", "message-item");

  console.log(item);
  messages.append(item);
  window.scrollTo(0, document.body.scrollHeight);
}

function downloadAPI(e) {
  let file_path = $(this).parent().attr("data-file-path");
  let file_name = $(this).parent().attr("data-file-name");
  //p(file_path)
  socket.emit("file download request", {
    file_path: file_path,
    room: current_chat.group_id,
    file_name: file_name,
  });
}

/**
 * 
 * @param {*} evt 
 */
function messageEditDispacher(evt) {
  p("edit click");
  p(evt);
  let item = $(this).closest(".message-item");
  let message_id = item.attr("data-message-id");

  let text = item.find(".message-content").text();

  let input = $("#input");
  input.attr("mode", "edit");
  input.attr("data-message-id", message_id);

  input.val(text);
}

function messageEditEndpoint(message, id) {
  let requestJson = {
    message: message,
    message_id: id,
    group_id: current_chat.group_id,
  };

  $.ajax({
    url: "chat/message/edit",
    type: "POST",
    data: requestJson,
    success: function (data) {
      p("success in msg deletion");
      p(data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Handle errors
      console.error("Error: " + textStatus + " - " + errorThrown);
    },
  });

  $(`.message-item[data-message-id = ${id}] .message-content`).text(message);
  let input = $("#input");
  input.attr("mode", "send");
  input.removeAttr("data-message-id");
  input.val("");
}


async function messageDelete(evt) {
  p("delete click");
  p(evt);

  let item = $(this).closest(".message-item");
  let message_id = item.attr("data-message-id");
  let group_id = item.attr("data-group-id");

  let requestJson = {
    message_id: message_id,
    group_id: group_id,
  };

  await $.ajax({
    url: "chat/message/delete",
    type: "POST",
    data: requestJson,
    success: function (data) {
      p("success in msg deletion");
      p(data);
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Handle errors
      console.error("Error: " + textStatus + " - " + errorThrown);
    },
  });

  item.remove();
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
    $("li[data-type='file'].message-item svg.file-download").click( downloadAPI );
    $("li.message-item div.dropdown li.edit").click( messageEditDispacher );
    $("li.message-item div.dropdown li.delete").click( messageDelete );

    // $("li.message-item svg.message-menu").click( ()=>{ p('menu click') } );

  }
}

async function createUserChat() {
  await $.ajax({
    url: "chat/getGroupID",
    type: "POST",
    data: { user_id: current_chat.user_id },
    success: function (data) {
      p("success in user group creation");
      p(data);
      current_chat.group_id = data.group_id;
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Handle errors
      console.error("Error: " + textStatus + " - " + errorThrown);
    },
  });
}

function refreshChatList() {
  // location.reload()
  getActiveChat();
  p("yipee");
}

function createGroupButtonHandler(e) {
  p("clicked");

  // $.ajax({
  //   url: "chat/group/create",
  //   type: "POST",
  //   //data: sendReqJson ,
  //   success: function (data) {
  //     // Handle the response from the server

  //     p(data);
  //   },
  //   error: function (jqXHR, textStatus, errorThrown) {
  //     // Handle errors
  //     console.log("Error: " + textStatus + " - " + errorThrown);
  //   },
  // });
}

function createGroupAPI(e) {
  e.preventDefault();

  let name = $("input#group-name");
  let description = $("textarea#group-description");
  // name[0].setCustomValidity("")

  let nameVal = name.val().trim();

  let hasName = false;

  p(nameVal + nameVal.trim());

  //nameVal = name.val().trim()
  p(nameVal + " - " + nameVal.length);
  if (nameVal.length == 0) {
    p("Please enter some text.");
    alert("Please enter some text.");
    // name[0].setCustomValidity("Please enter some text.");
    return;
  } else {
    name[0].setCustomValidity("");
  }

  // p("in here" + hasName)

  // p( `name : ${nameVal}`)
  // p(`description : ${description.val().trim()}`)

  let requestJson = {
    group_name: nameVal,
    group_description: description.val().trim(),
    // userList: [logged_user.id],
  };

  p(requestJson);

  $.ajax({
    url: "chat/group/create",
    type: "POST",
    data: requestJson,
    success: function (data) {
      // Handle the response from the server

      p(data);
      name.val("");
      description.val("");
      $(".modal-close").click();
      refreshChatList();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Handle errors
      console.log("Error: " + textStatus + " - " + errorThrown);
    },
  });
}

function exitGroupHandler() {
  $.ajax({
    url: "chat/group/exit",
    type: "POST",
    data: { group_id: current_chat.group_id },
    success: function (data) {
      // Handle the response from the server

      p(data);
      p("success");
      refreshChatList();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Handle errors
      console.log("Error: " + textStatus + " - " + errorThrown);
    },
  });
}

function deleteGroupHandler() {
  p("sjn");
  $.ajax({
    url: "chat/group/delete",
    type: "POST",
    data: { group_id: current_chat.group_id },
    success: function (data) {
      // Handle the response from the server

      p(data);
      p("successfull deletion");
      refreshChatList();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Handle errors
      console.error("Error: " + textStatus + " - " + errorThrown);
    },
  });
}

function updateGroupHandeler() {
  $.ajax({
    url: "chat/group/getInfo",
    type: "POST",
    data: { group_id: current_chat.group_id },
    success: function (data) {
      // Handle the response from the server

      p(data);
      p("successfull record retrive");

      let name = $("div#updateGroup input#group-name-update");
      let description = $("div#updateGroup textarea#group-description-update");

      name.val(String(data.name));
      description.val(String(data.description));
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Handle errors
      console.error("Error: " + textStatus + " - " + errorThrown);
    },
  });
}

function updatClickHandler(e) {
  e.preventDefault();

  let name = $("div#updateGroup input#group-name-update");
  let description = $("div#updateGroup textarea#group-description-update");
  // name[0].setCustomValidity("")

  let nameVal = name.val().trim();

  let hasName = false;

  p(nameVal + nameVal.trim());

  //nameVal = name.val().trim()
  p(nameVal + " - " + nameVal.length);
  if (nameVal.length == 0) {
    p("Please enter some text.");
    alert("Please enter some text 2.");
    // name[0].setCustomValidity("Please enter some text.");
    return;
  } else {
    name[0].setCustomValidity("");
  }

  // p("in here" + hasName)

  // p( `name : ${nameVal}`)
  // p(`description : ${description.val().trim()}`)

  let requestJson = {
    group_id: current_chat.group_id,
    group_name: nameVal,
    group_description: description.val().trim(),
    // userList: [logged_user.id],
  };

  p(requestJson);

  $.ajax({
    url: "chat/group/update",
    type: "POST",
    data: requestJson,
    success: function (data) {
      // Handle the response from the server

      p(data);
      name.val("");
      description.val("");
      $(".update-modal-close").click();
      refreshChatList();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Handle errors
      console.log("Error: " + textStatus + " - " + errorThrown);
    },
  });
}

function createUserItem(userId, userName) {
  var userItem = $("<div>").addClass("user-item");
  var userCheckbox = $("<input>")
    .attr("type", "checkbox")
    .attr("data-user-id", userId);
  var userNameSpan = $("<span>").text(userName);

  userItem.append(userCheckbox);
  userItem.append(userNameSpan);

  return userItem;
}

function addUsersToModal(obj, selector) {
  p(obj);
  $(selector).empty();

  let object = obj.users;
  for (let index = 0; index < object.length; index++) {
    const ele = object[index];
    let temp = createUserItem(ele.user_id, ele.username);
    $(".box").append(temp);
  }

  // $('input[type="checkbox"]').on("click", function () {
  //   $(this).prop("checked", !$(this).prop("checked"));
  // });

  // $('input[type=checkbox]').click((e)=>{
  //   p(e)
  //   $(this).toggle();
  //   p("im clicked")
  // })

  $('input[type="checkbox"]').on('change', function() {
    if ($(this).is(':checked')) {
      $(this).attr('checked', true);
    } else {
      $(this).removeAttr('checked');
    }
  });
  
}

function addUserButtonClickHandler(e) {
  let requestJson = {
    group_id: current_chat.group_id,
  };

  $.ajax({
    url: "chat/group/user/add/getList",
    type: "POST",
    data: requestJson,
    success: function (data) {
      // Handle the response from the server

      // p(data);
      addUsersToModal(data, ".box");
      // $(".update-modal-close").click();
      // refreshChatList();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Handle errors
      console.log("Error: " + textStatus + " - " + errorThrown);
    },
  });
}

function addUserSubmit(e) {
  e.preventDefault();
  // var checkedUsers = $(' .box input[type="checkbox"]:checked');

  // p(checkedUsers)
  // checkedUsers =checkedUsers.serializeArray()

  var checkedInputs = $('form input[type="checkbox"]:checked').map(function() {
    return $(this).attr("data-user-id");
  }).get();
  
  p(checkedInputs);

  let requestJson = {
    group_id: current_chat.group_id,
    userList: checkedInputs, 
  };

  $.ajax({
    url: "chat/group/user/add/endpoint",
    type: "POST",
    data: requestJson,
    dataType : 'json',
    statusCode: {
      200: function () {
        p(data);
        p("asbjankamkamk")
        let t = $(".add-user-modal-close")
        p(t)
        t.click();
      },
    },
    success: function (data) {
      // Handle the response from the server

      p(data);
      // addUsersToModal(data, ".box");
      // $(".update-modal-close").click();
      // refreshChatList();
    },
    error: function (jqXHR, textStatus, errorThrown) {
      // Handle errors
      console.log("Error: " + textStatus + " - " + errorThrown);
    },
  });

  $(".add-user-modal-close").click()

}

function saveArrayBufferAsFile(arrayBuffer, fileName) {
  // Create a new Blob object
  const blob = new Blob([arrayBuffer]);

  // Create a new URL object
  const url = URL.createObjectURL(blob);

  // Create a new anchor element
  const link = document.createElement('a');

  // Set the href and download attributes
  link.href = url;
  link.download = fileName;

  // Programmatically click the anchor element
  link.click();
}

function createSeeUserItem(userId, userName) {
  function getDropdown() {
    let getListElement = (className, name) => {
      return $("<li>").addClass(className).text(name);
    };

    let list = $("<ul>").addClass("dropdown-menu");

    let removeUser = getListElement("dropdown-item remove-user", "Remove User");
    let setAdmin = getListElement("dropdown-item set-admin", "Set Admin");

    list.append(setAdmin);
    list.append(removeUser);

    let item = $("<div>")
      .addClass("dropdown see-user-action-dropdown")
      .attr("style", "display:inline;");

    let menu_icon = `<svg xmlns="http://www.w3.org/2000/svg"
    class="see-user-toggle dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false"
    width="16" height="16" fill="currentColor" class="bi bi-three-dots-vertical" viewBox="0 0 16 16">
    <path d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
    </svg>`;

    item.append(menu_icon);
    item.append(list);

    return item;
  }

  let dropdown = getDropdown();

  var userItem = $("<div>")
    .addClass("see-user-item")
    .attr("data-user-id", userId);
  var userNameSpan = $("<span>").text(userName);

  userItem.append(dropdown);
  userItem.append(userNameSpan);

  return userItem;
}

function addUsersToModalSeeUser(obj, selector) {
  p(obj);
  $(selector).empty();

  let object = obj.userList;
  for (let index = 0; index < object.length; index++) {
    const ele = object[index];
    let temp = createSeeUserItem(ele.user_id, ele.username);
    $(selector).append(temp);
  }

}

function seeUserHandler(evt) {
  p("in see users");
  let requestJson = {
    group_id: current_chat.group_id,
  };

  $.ajax({
    url: "chat/group/userList/get",
    type: "POST",
    data: requestJson,
    success: function (data) {
      addUsersToModalSeeUser(data, ".see-users-box");
    },
    error: function (jqXHR, textStatus, errorThrown) {
      console.log("Error: " + textStatus + " - " + errorThrown);
    },
  });
}