function hello() {
  console.log("hello world");
}

function p(params) {
  console.log(params);
}

/**
 *
 * takes json object containing users and groups
 * displays them
 */
function searchDisplay(object) {
  function giveUlContent(list, ul_obj) {
    $.each(list, function (index, value) {
      var li = $("<li>").text(value.name);
      var span = $("<span>").addClass("chat-nav-item").append(li);
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
  giveUlContent(object.users, user_ul);
  $(heading_tag).append(user_ul);

  // groups
  var group_heading = $("<h1>").text("Groups (" + object.groups.length + ") :");
  $(heading_tag).append(group_heading);

  var group_ul = $("<ul>");
  giveUlContent(object.groups, group_ul);
  $(heading_tag).append(group_ul);
}

function displaChatList( object ){
  p(object)
  
}
