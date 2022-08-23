/* initialise constants needed often ---------------------------------------- */
const emojibar = document.getElementById("emojibar");
const chatbar = document.getElementById("js-chatbar");
const emojibar_toggle = document.getElementById("emojibar_toggle");
const message_submit = document.getElementById("send_message");
const message_input_field = document.getElementById("textbox_id");
const chatbox_wrapper = document.getElementById('chatbox_wrapper');
const chatbox_chat_wrapper = document.getElementById('chatbox_chat_wrapper');


/* functionality, performance, user experience ------------------------------ */
function disable_message_submit() {
  message_submit.disabled = true;
}

function enable_message_submit() {
  message_submit.disabled = false;
}

/* toggle the editor menu bar */
function toggle_chatbar() {
  if (chatbar.classList.contains("--is-active")) {
    enable_message_submit();
    chatbar.classList.add("--drop");
    chatbar.classList.add("--drop");
    chatbar.classList.remove("--is-active");
    setTimeout(function() {
      chatbar.classList.remove("--drop");
    }, 600);
  } else {
    disable_message_submit();
    chatbar.classList.add("--bop");
    chatbar.classList.add("--is-active");
    setTimeout(function() {
      chatbar.classList.remove("--bop");
    }, 600);
  }
}

/* toggle the editor emoji bar */
function toggle_emojibar() {
  if (emojibar.classList.contains("emojibar-active")) {
    emojibar.classList.remove("emojibar-active");
    // enable_message_submit();
    console.log("emojibar is deactivated");
  } else {
    // on emoji select close emojibar and chatbar
    emojibar.classList.add("emojibar-active");
    // disable_message_submit();
    console.log("emojibar is activated");
  }
}


/* sending and recieving messages ------------------------------------------- */
/* on message send */
message_submit.addEventListener("click", function(e) {
  e.preventDefault();
  let tmp_message = document.getElementById("textbox_id").value;

  if (chatbar.disabled) {
    console.warn("message_submit is deactivated rn!");
    message_submit.classList.add("send_message_deactivated");
  } else {
    // check if inputfields value is empty
    if (tmp_message === '' | tmp_message === null) {
      console.warn("please type something to message_submit!");
    } else {
      console.log("send message:" + tmp_message);
      let tmp_timestamp = String(get_timestamp());
      validate_visitors_message(tmp_message, tmp_timestamp);
    }
  }
});

/* being able to send a message with return key */
message_input_field.addEventListener("keypress", function(e) {
  // If the user presses the "Enter" key on the keyboard
  if (e.key === "Enter") {
    // Cancel the default action, if needed
    e.preventDefault();
    // Trigger the button element with a click
    message_submit.click();
  }
});

/* validation for visitors message */
function validate_visitors_message(message, timestamp) {
  window.alert('send message: ' + message);

  let sender_img_dir = 'static/chatbot_assets/img/header.jpg';

  // do some validation ...
  let message_is_valid = true;

  if (message_is_valid) {
    // if validation is ok

    // chat_id, bot_id, action_id, action_type, timestamp, message, sender
    //let data_array = get_data_from_last_message('operator');

    // add the visitors message to chat_history then to the chatbox chat
    // action_id, action_type, timestamp, message, sender
    //add_message_to_chat_history(data_array[2], data_array[3], timestamp, message, 'visitor');
    add_message_to_chat_history('', '', timestamp, message, 'visitor');

    // timestamp, message, sender, sender_img_dir
    add_message_to_chat(timestamp, message, 'visitor', sender_img_dir);

    // override the message input field value to empty string
    clear_message_input_value();

    // post the clients message and get a response of the chatbot
    post_text_message(message, timestamp);

  } else if (!message_is_valid) {
    // if validation failed
    throw_validation_error(error);
  }
}

/* */

/* prep for posting the clients message (send type text) */
function post_text_message(message, timestamp) {

  //debugger;

  let sender_img_dir = 'static/chatbot_assets/img/header.jpg';

  // init variables needed for fetch
  let chat_id = get_active_chat();
  let message_obj = {};

  // chat_id, bot_id, action_id, action_type, timestamp, message, sender
  let data_array = get_data_from_last_message('operator');

  if (data_array[3] == 'Message') {
    // insert variable chat_id to message_obj
    message_obj = {
      'action_id': data_array[2],
      'action_type': data_array[3],
      'timestamp': timestamp,
      'content': message,
      'chat_id': data_array[0],
      'bot_id': data_array[1]
    }

    // post the answer object (json)
    fetch_message('Text', message_obj);

  } else if (data_array[3] == 'IntentQuestion') {

    let content = {'answer': message, 'asked': 'true'};

    // insert variable chat_id to message_obj
    message_obj = {
      'action_id': data_array[2],
      'action_type': data_array[3],
      'timestamp': timestamp,
      'content': content,
      'chat_id': '968',
      'bot_id': '4201'
    }

    // post the answer object (json)
    fetch_message('Text', message_obj);

  } else if (data_array[3] == 'Button') {

    // message will be ignored. react with button via click!
    console.error('please press a button in the chat window!');

  }

};

/* prep for posting the clients message (send type button) */
function post_button_answer(btn_name_, btn_value_, timestamp_) {

  //debugger;

  let sender_img_dir = 'static/chatbot_assets/img/header.jpg';

  // init variables needed for fetch
  let chat_id = get_active_chat();

  // chat_id, bot_id, action_id, action_type, timestamp, message, sender
  let data_array = get_data_from_last_message('operator');

  let content_obj = {'name': btn_name_, 'value': btn_value_};

  // btn_name_, btn_value_, timestamp_
  let message_obj = {
    'action_id': data_array[2],
    'action_type': 'Button',
    'timestamp': timestamp_,
    'content': content_obj,
    'chat_id': chat_id,
    'bot_id': '4201'
  }

  console.log('message_obj');
  console.log(message_obj);

  // post the answer object (json)
  fetch_message('Button', message_obj);

  enable_message_submit();

};

/* post the clients message then recieve the chatbots response */
function fetch_message(message_type, message_obj) {

  //debugger;

  // fetch
  const url = 'http://127.0.0.1:5000/usermessage';
  fetch(url, {
      method: 'POST',
      body: JSON.stringify(message_obj),
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': url
      },
    })
    .then(r => r.json())
    .then(r => {

      debugger;

      let dbg = r;
      console.log('r: ' + dbg);
      console.log('r.messages: ' + r.messages);

      let action_id = '';
      let action_type = '';
      let bot_id = '';
      let content = '';
      let timestamp = '';

      /* get information out of response */
      try {

        let sender_img_dir = 'static/chatbot_assets/img/header.jpg';

        // check for action_type
        // types: Message, Button, IntentQuestion

        // veraltet...
        if (typeof r.action_type === 'string' || r.action_type instanceof String) {
          switch (r.action_type) {
            case 'Message':
              console.log('--- Message ---');
              console.log('action_id: ' + r.action_id);
              console.log('action_type: ' + r.action_type);
              console.log('bot_id: ' + r.bot_id);
              console.log('content: ' + r.content);
              console.log('timestamp: ' + r.timestamp);
              action_id = r.action_id;
              action_type = 'Message';
              bot_id = r.bot_id;
              content = r.content;
              timestamp = r.timestamp;

              // action_id, action_type, timestamp, message, sender
              add_message_to_chat_history(action_id, action_type, timestamp, content, 'operator');

              // timestamp, message, sender, sender_img_dir
              //let sender_img_dir = 'static/chatbot_assets/img/header.jpg';
              add_message_to_chat(timestamp, content, 'operator', sender_img_dir);

              break;
            case 'Button':
              console.log('--- Button ---');
              console.log('action_id: ' + r.action_id);
              console.log('action_type: ' + r.action_type);
              console.log('bot_id: ' + r.bot_id);
              console.log('buttons: ' + r.content);
              console.log('buttons.toString(): ' + r.content.toString());
              console.log('timestamp: ' + r.timestamp);
              action_id = r.action_id;
              action_type = 'Button';
              bot_id = r.bot_id;
              content = r.content.toString();
              let content_array = r.content;
              let content_array_length = content_array.length;

              const buttons_list = [];

              for (let i = 0; i < content_array_length; i++) {
                console.log('buttons[i]: #' + i);
                console.log('buttons[i]: ' + r.content[i]);
                console.log('buttons[i].name: ' + r.content[i].name);
                console.log('buttons[i].value: ' + r.content[i].value);
                if (i == 1) {content = r.content[i].name}

                buttons_list[i] += [r.content[i].name.toString(), parseInt(r.content[i].value)]
              }
              timestamp = r.timestamp;

              // action_id, action_type, timestamp, message, sender
              add_message_to_chat_history(action_id, action_type, timestamp, content, 'operator');

              // timestamp, buttons_list, message, sender, sender_img_dir
              add_button_to_chat(timestamp, buttons_list, '', 'operator', 'static/chatbot_assets/img/header.jpg');

              disable_message_submit();

              break;
            case 'IntentQuestion':
              console.log('--- IntentQuestion as array ---');
              console.log('action_id: ' + r.action_id);
              console.log('action_type: ' + r.action_type);
              console.log('bot_id: ' + r.bot_id);
              console.log('content.answer: ' + r.content.answer);
              console.log('timestamp: ' + r.timestamp);
              action_id = r.action_id;
              action_type = 'IntentQuestion';
              bot_id = r.bot_id;
              content = r.content.answer; // evtl anpassen
              timestamp = r.timestamp;

              // action_id, action_type, timestamp, message, sender
              add_message_to_chat_history(action_id, action_type, timestamp, content, 'operator');

              // timestamp, message, sender, sender_img_dir
              let sender_img_dir = 'static/chatbot_assets/img/header.jpg';
              add_message_to_chat(timestamp, content, 'operator', sender_img_dir);

            }
        } else if (Array.isArray(r.messages)) {

          console.log(r.messages.length);

          for (let i = 0; i < r.messages.length; i++) {

            if (r.messages[i].action_type == 'Message') {
              let messages_length = r.messages.length;

              for (let i = 0; i < messages_length; i++) {
                console.log('--- messages list #' + i + ' ---');
                console.log('action_id: ' + r.messages[i].action_id);
                console.log('action_type: ' + r.messages[i].action_type);
                console.log('bot_id: ' + r.messages[i].bot_id);
                console.log('message: ' + r.messages[i].content);
                console.log('timestamp: ' + r.messages[i].timestamp);
              }

              let last_item_index = messages_length - 1;
              action_id = r.messages[last_item_index].action_id
              action_type = r.messages[last_item_index].action_type
              bot_id = r.messages[last_item_index].bot_id
              content = r.messages[last_item_index].content
              timestamp = r.messages[last_item_index].timestamp

              // action_id, action_type, timestamp, message, sender
              add_message_to_chat_history(action_id, action_type, timestamp, content, 'operator');

              // timestamp, message, sender, sender_img_dir
              let sender_img_dir = 'static/chatbot_assets/img/header.jpg';
              add_message_to_chat(timestamp, content, 'operator', sender_img_dir);

            } else if (r.messages[i].action_type == 'IntentQuestion') {
              /*
              let messages_length = r.messages.length;

              for (let i = 0; i < messages_length; i++) {
                console.log('--- intentQuestion list #' + i + ' ---');
                console.log('action_id: ' + r.messages[i].action_id);
                console.log('action_type: ' + r.messages[i].action_type);
                console.log('bot_id: ' + r.messages[i].bot_id);
                console.log('message: ' + r.messages[i].content.answer);
                console.log('timestamp: ' + r.messages[i].timestamp);
              }

              let last_item_index = messages_length - 1;
              action_id = r.messages[last_item_index].action_id
              action_type = r.messages[last_item_index].action_type
              bot_id = r.messages[last_item_index].bot_id
              content = r.messages[last_item_index].content.answer
              timestamp = r.messages[last_item_index].timestamp
              */

              action_id = r.messages[i].action_id
              action_type = r.messages[i].action_type
              bot_id = r.messages[i].bot_id
              content = r.messages[i].content.answer
              timestamp = r.messages[i].timestamp

              // action_id, action_type, timestamp, message, sender
              add_message_to_chat_history(action_id, action_type, timestamp, content, 'operator');

              // timestamp, message, sender, sender_img_dir
              let sender_img_dir = 'static/chatbot_assets/img/header.jpg';
              add_message_to_chat(timestamp, content, 'operator', sender_img_dir);

            } else if (r.messages[i].action_type == 'Button') {
              console.log('--- Button ---');
              console.log('action_id: ' + r.messages[i].action_id);
              console.log('action_type: ' + r.messages[i].action_type);
              console.log('bot_id: ' + r.messages[i].bot_id);
              console.log('buttons: ' + r.messages[i].content);
              console.log('buttons.toString(): ' + r.messages[i].content.toString());
              console.log('timestamp: ' + r.messages[i].timestamp);
              action_id = r.messages[i].action_id;
              action_type = 'Button';
              bot_id = r.messages[i].bot_id;
              content = r.messages[i].content;


              let content_array = r.messages[i].content;

              try {
                console.log("typeof r");
                /* replacing all ' with " */
                content_array = r.messages[i].content.replace(/'/g, '"');
              } catch {}


              try {
                content_array = JSON.parse(content_array);
              } catch {}

              let content_array_length = content_array.length;

              const buttons_list = [];

              // vorbereitung für den nächsten pull
              // message object rausziehen und im add_button_to_chat aufruf übergeben:
              let message = JSON.parse(JSON.stringify(content_array[0])).message.toString();
              console.log(message);

              for (let i = 1; i < content_array_length; i++) {
                let x = JSON.stringify(content_array[i]);
                x = JSON.parse(x);
                console.log(x);
                console.log(x.name);
                console.log(x.value);

                /*
                console.log('buttons[i]: #' + i);
                console.log('buttons[i].name: ' + content_array[i]);
                console.log('buttons[i].value: ' + content_array[i]);
                //if (i == 1) {content = r.content[i].name}

                buttons_list[i] += [content_array.name, content_array.value]
                */

                if (x.name == 'Default') {
                  continue;
                }

                //if(x.Value == '') {x.Value = '-';}
                buttons_list.push([x.name, x.value]);

              }
              timestamp = r.messages[i].timestamp;

              console.log('buttons_list: ' + buttons_list);

              // action_id, action_type, timestamp, message, sender
              add_message_to_chat_history(action_id, action_type, timestamp, content, 'operator');

              // timestamp, buttons_list, message, sender, sender_img_dir
              add_button_to_chat(timestamp, buttons_list, message, 'operator', 'static/chatbot_assets/img/header.jpg');

              disable_message_submit();
            }
          }

        }
      } catch(e) {console.error(e.message);}

      scroll_to_bottom_of_chat();

    }).catch((error) => {
      console.error('Error:', error);
    });
}

/* throw an error if message validation failes */
function throw_validation_error(error) {
  // show error in chatbox, so client can see it
  alert('validation failed. pls try something else...\nerror-message: ' + error);
};

/* override the message input field value to empty string */
function clear_message_input_value() {
  document.getElementById("textbox_id").value = "";
};

/* clear the html chat */
function clear_chatbox_chat() {
  chatbox_chat_wrapper.innerHTML = '';
};

/* start with last message sent when chat opens */
function scroll_to_bottom_of_chat() {
  chatbox_wrapper.scrollTop = chatbox_wrapper.scrollHeight;
}


/* wroking with the local storage ------------------------------------------- */
/* check for available chat historys */
function check_available_chats() {

  if (localStorage.getItem('chat_ids') != null && typeof JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'] !== 'undefined' && JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'].length > 0) {
    // chat_ids is not null, not undefined and has at least one entry
    console.log('chat_ids exists.');
    console.log('chat_ids array: ' + JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage']);
    console.log('active_chat: ' + JSON.parse(localStorage.getItem('active_chat')));

    // making sure, the messages will show up in the chatbox
    let active_chat = get_active_chat();
    restore_chat(active_chat);

    // ask for restoring an old chat or simply create a new one
    //restore_or_create();

  } else {
    // no chats available, create a new one
    console.log('chat_ids doesn\'t exist.');
    set_chat_ids();
  }
}

/* set initial chat_ids array */
function set_chat_ids() {

  if (localStorage.getItem('chat_ids') != null && typeof JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'] !== 'undefined' && JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'].length > 0) {
    // chat_ids is not null, not undefined and has at least one entry
  } else {
    // generate chat_id
    let _uuid = '' + create_ci_uuidv4();

    // create an array and add the generated chat_id
    let chat_ids_array = [];
    chat_ids_array.push(_uuid);

    const chat_ids = {
      'chats_in_localStorage': chat_ids_array
    }

    // add the chat_ids object to the local storage
    localStorage.setItem('chat_ids', JSON.stringify(chat_ids));

    // set a entry for the active chat
    set_active_chat(_uuid);

    // call get_welcome_message()
    get_welcome_message(_uuid);

  }
};

/* set new chat entry + chat_history */
function set_new_chat(chat_id, bot_id, welcome_message, action_id, action_type) {
  let chats_in_localStorage = JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'];
  if (localStorage.getItem('chat_ids') != null && typeof chats_in_localStorage !== 'undefined' && chats_in_localStorage.length > 0) {
    // get the chat_id of the last item in array
    let last_chat_index = chats_in_localStorage.length - 1;
    let chat_id_of_last_item = '' + chats_in_localStorage[last_chat_index];

    if (String(chat_id) === String(chat_id_of_last_item)) {
      // create a new entry in local storage for this chat_id
      const new_chat_id_entry = {
        'chat_id': String(chat_id),
        'bot_id': String(bot_id),
        'chat_history': [{
          'action_id': String(action_id),
          'action_type': String(action_type),
          'timestamp': String(get_timestamp()),
          'content': String(welcome_message),
          'sender': 'operator'
        }]
      }

      // set the new entry in local storage for this chat_id
      localStorage.setItem(String(chat_id_of_last_item), JSON.stringify(new_chat_id_entry));

      // set a entry for the active chat (redundant)
      set_active_chat(chat_id);

      console.log('new chats chat_id: ' + chat_id);

    } else {
      console.error('add the chat_id to chat_ids.chats_in_localStorage array first!');
    }
  } else {
    console.error('initialise chat_ids first!');
  }
};

/* add chat_id to chat_ids */
function add_id_to_chat_ids(new_chat_id) {

  if (localStorage.getItem('chat_ids') != null && typeof JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'] !== 'undefined' && JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'].length > 0) {
    // chat_ids is not null, not undefined and has at least one entry
    let chats_in_localStorage_array = JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'];

    // making sure new_chat_id is not in array, otherwise don't push it
    if (!(chats_in_localStorage_array.includes(new_chat_id))) {
      chats_in_localStorage_array.push(new_chat_id);
    }

    const chat_ids = {
      'chats_in_localStorage': chats_in_localStorage_array
    }

    // add the chat_ids object to the local storage
    localStorage.setItem('chat_ids', JSON.stringify(chat_ids));

    // update active_chat
    set_active_chat(new_chat_id);

    // call get_welcome_message()
    get_welcome_message(new_chat_id);

  }

  /*
    // not necessery anymore
    // you can call set_new_chat() but it will do nothing because chatt_ids
    // is initialised
    else {

    // create an array and add the generated chat_id
    let chat_ids_array = [];
    chat_ids_array.push(new_chat_id);

    const chat_ids = {
      'chats_in_localStorage': chat_ids_array
    }

    // add the chat_ids object to the local storage
    localStorage.setItem('chat_ids', JSON.stringify(chat_ids));

    // set a entry for the active chat
    set_active_chat(new_chat_id);

    // call get_welcome_message()
    get_welcome_message(new_chat_id);
  }
  */
}

/* get_welcome_message and call set_new_chat() */
function get_welcome_message(chat_id) {

  //debugger;

  let bot_id = '4201';
  let welcome_message = 'This is some initial message.';
  let action_id = '968';
  let action_type = 'message';

  // init variables needed for fetch
  let timestamp = get_timestamp();

  const init_obj = {
    'action_id': '968',
    'action_type': 'message',
    'timestamp': timestamp,
    'content': 'This is some initial message.',
    'chat_id': chat_id,
    'bot_id': '4201'
  };

  // fetch welcome_message
  let url = 'http://127.0.0.1:5000/initialise_chat';
  fetch(url, {
      method: 'POST',
      body: JSON.stringify(init_obj),
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': url
      },
    })
    .then(r => r.json())
    .then(r => {

      let dbg = r;

      if (r.action_type == 'Message') {
        console.log('-------------- init --------------');
        console.log('action_id: ' + r.action_id);
        console.log('action_type: ' + r.action_type);
        console.log('bot_id: ' + r.bot_id);
        console.log('message: ' + r.content);
        console.log('timestamp: ' + r.timestamp);

        // chat_id, bot_id, welcome_message, action_id, action_type
        set_new_chat(chat_id, r.bot_id, r.content, r.action_id, r.action_type);

        // timestamp, message, sender, sender_img_dir
        add_message_to_chat(timestamp, r.content, 'operator', 'static/chatbot_assets/img/header.jpg');

        scroll_to_bottom_of_chat();
      }

      if (r.action_type == 'Button') {

        console.log(r);
        console.log(typeof r);
      }

    }).catch((error) => {
      console.error('Error: ', error);
    });

  /*
  // chat_id, bot_id, welcome_message, action_id, action_type
  set_new_chat(chat_id, bot_id, welcome_message, action_id, action_type);

  // timestamp, message, sender, sender_img_dir
  add_message_to_chat(get_timestamp(), welcome_message, 'operator', 'static/chatbot_assets/img/header.jpg');
  */
  // making sure, the message will show up in the chatbox
  restore_chat(chat_id);
};

/* get_welcome_message and call set_new_chat() */
function get_welcome_back_message(chat_id) {

  let bot_id = '4200';
  let welcome_back_message = 'hello back init message.';
  let action_id = '111';
  let action_type = 'message';
  let timestamp = get_timestamp();

  // fetch welcome_back_message

  // action_id, action_type, timestamp, message, sender
  add_message_to_chat_history(action_id, action_type, timestamp, welcome_back_message, 'operator');

  // timestamp, message, sender, sender_img_dir
  add_message_to_chat(timestamp, welcome_back_message, 'operator', 'static/chatbot_assets/img/header.jpg');

  // making sure, the message will show up in the chatbox
  restore_chat(chat_id);
};

/* set active_chat to local storage */
function set_active_chat(chat_id) {

  // dont need this obj anymore
  const active_chat = {
    'active_chat': chat_id
  };

  localStorage.setItem('active_chat', JSON.stringify(chat_id));
}

/* get active_chat from local storage */
function get_active_chat() {
  if (localStorage.getItem('active_chat') === null) {
    return false;
  }
  return '' + JSON.parse(localStorage.getItem('active_chat'));
}

/* ask if clients wants to restore chat or create new one */
function restore_or_create() {
  // ask client if he wants to restore an safed chat or create a new one
  // then set active chat to whatever the client wants
  // clear and fill chatbox => restore_chat(chat_id)

  if (confirm('Create new = OK; Restore = CANCEL')) {
    // on ok

    // generate chat_id
    let _uuid = '' + create_ci_uuidv4();

    // set active_chat
    set_active_chat(_uuid);

    // add the new chat_id to the chat_ids array
    add_id_to_chat_ids(_uuid);

    // create a new chat and get welcome_back_message
    get_welcome_message(_uuid);

    console.log('decision: create new chat (' + _uuid + ')');

  } else {
    // on cancel

    console.log('decision: restore chat');

    // clear chatbox
    //clear_chatbox_chat();

    // use dummy chat
    test_add_chat();

    // let the client choose one of the available chats
    choose_available_chat();

  }

}

/* button in chat triggers this function */
/* answer the request and post it to the server –> post_text_message */
function post_decision_(btn_name_, btn_value_, timestamp_) {

  /* for post_button_answer():
  let chat_id = get_active_chat();
  let message_obj = {
    'action_id': btn_name_,
    'action_type': 'Button',
    'timestamp': timestamp_,
    'content': btn_value_,
    'chat_id': chat_id,
    'bot_id': '4200'
  }
  */

  post_button_answer(btn_name_, btn_value_, timestamp_);

   document.querySelectorAll('button.btn_choose_').forEach(button => {
       button.disabled = true;
   });
};

/* ask client which available chat he wants to restore */
function choose_available_chat() {
  // get all available chats
  if (localStorage.getItem('chat_ids') != null && typeof JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'] !== 'undefined' && JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'].length > 0) {
    // chat_ids is not null, not undefined and has at least one entry
    let chats_in_localStorage_array = JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'];

    console.log('all available chats:');

    for (let i = 0; i < chats_in_localStorage_array.length; i++) {
      console.log('#' + i + ': ' + chats_in_localStorage_array[i]);
    }

  }

  // let the client choose one
  let chat_decision = 'ci:e6fd8330-05e7-4e88-a1b5-a77d6ee8359e';
  //let chat_decision = 'ci:b18aa965-e6b2-4ad7-820a-23c973fece07';

  console.log('chat restored: ' + chat_decision);

  // set active chat
  set_active_chat(chat_decision);

  // call welcome_back_message()
  get_welcome_back_message(chat_decision);

  //


};

/* add a message to the chats chat_history */
function add_message_to_chat_history(action_id, action_type, timestamp, message, sender) {

  // collect data needed to add message item (json) to chat_history
  let chat_id = get_active_chat();

  let chat_item_json = JSON.parse(localStorage.getItem(chat_id));
  let bot_id = chat_item_json['bot_id'];
  let chat_history_array = chat_item_json['chat_history'];
  let last_chat_history_item_index = chat_history_array.length - 1;
  let last_chat_history_item_sender = '';
  let last_chat_history_item_action_id = '';
  let last_chat_history_item_action_type = '';


  if (sender === 'visitor') {
    // get data from last item in chat_history sent by the operator
    let is_operator = false;
    while (!is_operator) {
      last_chat_history_item_sender = String(chat_item_json['chat_history'][last_chat_history_item_index]['sender']);

      if (last_chat_history_item_sender === 'operator') {
        is_operator = true;
        last_chat_history_item_action_id = String(chat_item_json['chat_history'][last_chat_history_item_index]['action_id']);
        last_chat_history_item_action_type = String(chat_item_json['chat_history'][last_chat_history_item_index]['action_type']);

        let new_chat_history_item = {
          'action_id': last_chat_history_item_action_id,
          'action_type': last_chat_history_item_action_type,
          'timestamp': timestamp,
          'content': message,
          'sender': 'visitor'
        }

        // adding the element to the chat_history array in local storage
        chat_item_json['chat_history'].push(new_chat_history_item);
        localStorage.setItem(chat_id, JSON.stringify(chat_item_json));

      } else {
        last_chat_history_item_index -= 1;
      }
    }

  } else if (sender === 'operator') {
    // use data hand over by fetch (from server as chatbot response)

    let new_chat_history_item = {
      'action_id': action_id,
      'action_type': action_type,
      'timestamp': timestamp,
      'content': message,
      'sender': 'operator'
    }

    // adding the element to the chat_history array in local storage
    chat_item_json['chat_history'].push(new_chat_history_item);
    localStorage.setItem(chat_id, JSON.stringify(chat_item_json));

  } else {
    console.error('var sender error!');
  }
};

/* add message to chat */
function add_message_to_chat(timestamp, message, sender, sender_img_dir) {

  let timestamp_time = String(get_time_from_timestamp(timestamp));
  let message_sent = '<div class="message_wrapper"><div class="col messages_item messages_item-' + sender + '"><p class="message_type_text">' + message + '</p><div class="sender_info_in-message-' + sender + '"><p class="time_sent">' + timestamp_time + '</p></div></div><div class="message_item_info message_item_info_' + sender + '"><p class="sender_info"><span class="name_sent"><i>' + sender + '</i></span><span class="time_sent"><i>' + timestamp_time + '</i></span></p></div></div><div class="message_sender_img_wrapper-visitor"><picture><img src="' + sender_img_dir + '" style="max-width: 30px;max-height: 30px;height:30px;border-radius: 20%;background: rgba(255,255,255,0);" alt="' + sender + '-img" /></picture></div>';
  let temp = document.createElement('div');
  temp.innerHTML = message_sent;
  //var wrapper = temp.firstChild;
  temp.classList.add("col");
  temp.classList.add("message_item_wrapper");
  temp.classList.add("message_item_wrapper-" + sender);
  if (document.querySelector('.message_item_wrapper:last-child') != null) {
    // if there is a last message, use it
    let last_message_wrapper = document.querySelector('.message_item_wrapper:last-child'); // OR document.querySelector('.message_item_wrapper');
    last_message_wrapper.parentNode.appendChild(temp);
  } else {
    // if chat history is empty, use parent node
    chatbox_chat_wrapper.appendChild(temp);
  }

  scroll_to_bottom_of_chat();
};

function add_button_to_chat(timestamp, buttons_list, message, sender, sender_img_dir) {

  //debugger;

  //message = "some dummy message";

  let buttons = '';

  for (let i = 0; i < buttons_list.length; i++) {
    buttons += '<button type="button" class="btn_choose_" onclick="post_decision_(\'' + buttons_list[i][0] + '\', \'' + buttons_list[i][1] + '\', \'' + timestamp + '\')" style="margin:5px;">' + buttons_list[i][0] + '</button>';
  }

  console.log(buttons);

    /* linked to add_message_to_chat()! */

  let timestamp_time = String(get_time_from_timestamp(timestamp));
  let message_sent = '<div class="message_wrapper"><div class="col messages_item messages_item-' + sender + '"><p class="message_type_text">' + message + '</p><div class="btn_choose_answer">' + buttons + '</div><div class="sender_info_in-message-' + sender + '"><p class="time_sent">' + timestamp_time + '</p></div></div><div class="message_item_info message_item_info_' + sender + '"><p class="sender_info"><span class="name_sent"><i>' + sender + '</i></span><span class="time_sent"><i>' + timestamp_time + '</i></span></p></div></div><div class="message_sender_img_wrapper-visitor"><picture><img src="' + sender_img_dir + '" style="max-width: 30px;max-height: 30px;height:30px;border-radius: 20%;background: rgba(255,255,255,0);" alt="' + sender + '-img" /></picture></div>';
  let temp = document.createElement('div');
  temp.innerHTML = message_sent;
  //var wrapper = temp.firstChild;
  temp.classList.add("col");
  temp.classList.add("message_item_wrapper");
  temp.classList.add("message_item_wrapper-" + sender);

  /*
  if (document.querySelector('.message_item_wrapper:last-child') != null) {
    // if there is a last message, use it
    let last_message_wrapper = document.querySelector('.message_item_wrapper:last-child'); // OR document.querySelector('.message_item_wrapper');
    last_message_wrapper.parentNode.appendChild(temp);
  } else {
    // if chat history is empty, use parent node
    chatbox_chat_wrapper.appendChild(temp);
  }
  */

  chatbox_chat_wrapper.appendChild(temp);

  scroll_to_bottom_of_chat();
};

/* restore chat: get all items from chat_history (local storage) and add them to chat */
function restore_chat(chat_id) {

  //debugger;

  let chat_item_json = JSON.parse(localStorage.getItem(chat_id));
  //let bot_id = chat_item_json['bot_id'];
  let chat_history_array = chat_item_json['chat_history'];

  let tmp_timestamp = '';
  let tmp_message = '';
  let tmp_sender = '';
  let tmp_sender_img_dir = '';

  clear_chatbox_chat();
  set_active_chat(chat_id);

  for (let i = 0; i < chat_history_array.length; i++) {

    tmp_timestamp = String(chat_history_array[i]['timestamp']);
    tmp_message = String(chat_history_array[i]['content']);
    tmp_sender = String(chat_history_array[i]['sender']);
    tmp_sender_img_dir = 'static/chatbot_assets/img/header.jpg';

    if (chat_history_array[i]['action_type'] == 'Message' | chat_history_array[i]['action_type'] == 'IntentQuestion') {
      //timestamp, message, sender, sender_img_dir
      add_message_to_chat(tmp_timestamp, tmp_message, tmp_sender, tmp_sender_img_dir);
    } else if (chat_history_array[i]['action_type'] == 'Button') {
      //timestamp, buttons_list, message, sender, sender_img_dir
      add_button_to_chat(tmp_timestamp, tmp_message, tmp_sender, tmp_sender_img_dir);
    }


  }

  console.log('active_chat: ' + JSON.parse(localStorage.getItem('active_chat')));

};

/* remove an chat and every item, where it is listed */
function remove_chat(chat_id) {

  // remove ls entry with key = chat_id
  if (localStorage.getItem(chat_id) != null) {
    localStorage.removeItem(chat_id);
  }

  // remove chat_id from chat_ids array
  remove_id_from_chat_ids(chat_id);

  // check what to do after removing the chat + item in chat_ids array
  restore_or_create();

};

/* remove chat_id from chat_ids */
function remove_id_from_chat_ids(chat_id) {

  // remove from chat_ids array
  if (localStorage.getItem('chat_ids') != null && typeof JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'] !== 'undefined' && JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'].length > 0) {
    let chats_in_localStorage = JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'];
    for (let i = 0; i < chats_in_localStorage.length; i++) {
      // if _uuid in chat_ids, try again. otherwise use it
      if (String(chats_in_localStorage[i]) === chat_id) {
        chats_in_localStorage.splice(i, 1);
      }
    }

    const chat_ids = {
      'chats_in_localStorage': chats_in_localStorage
    }
    // update the chat_ids object
    localStorage.setItem('chat_ids', JSON.stringify(chat_ids));
  } else {
    set_chat_ids();
  }
};

/* create new _uuid */
function create_ci_uuidv4() {
  let _uuid = 'ci:' + ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));

  // making sure _uuid doesn't used yet
  if (localStorage.getItem('chat_ids') != null && typeof JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'] !== 'undefined' && JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'].length > 0) {
    let chats_in_localStorage = JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'];
    for (let i = 0; i < chats_in_localStorage.length; i++) {
      // if _uuid in chat_ids, try again. otherwise use it
      if (String(chats_in_localStorage[i]) == _uuid) {
        console.log('_uuid is redundant!');
        create_ci_uuidv4();
      } else {
        // if no chat_ids in ls, return _uuid
        return _uuid;
      }
    }
  } else {
    return _uuid;
  }
};

/* working with the timestamp */
function get_timestamp() {
  // format: 'year-month-day hours:seconds'
  let tmp_current = new Date();
  let tmp_current_fullyear = tmp_current.getFullYear();
  let tmp_current_month = tmp_current.getMonth();
  let tmp_current_day = tmp_current.getDay();
  let tmp_current_hours = tmp_current.getHours();
  let tmp_current_minutes = tmp_current.getMinutes();
  let tmp_current_seconds = tmp_current.getSeconds();

  if (tmp_current_month < 10) {
    tmp_current_month = '0' + tmp_current_month;
  }
  if (tmp_current_day === 0) {
    tmp_current_day = '00';
  }
  if (tmp_current_day < 10) {
    tmp_current_day = '0' + tmp_current_day;
  }
  if (tmp_current_hours === 0) {
    tmp_current_hours = '00';
  }
  if (tmp_current_hours < 10) {
    tmp_current_hours = '0' + tmp_current_hours;
  }
  if (tmp_current_minutes === 0) {
    tmp_current_minutes = '00';
  }
  if (tmp_current_minutes < 10) {
    tmp_current_minutes = '0' + tmp_current_minutes;
  }
  if (tmp_current_seconds === 0) {
    tmp_current_seconds = '00';
  }
  if (tmp_current_seconds < 10) {
    tmp_current_seconds = '0' + tmp_current_seconds;
  }
  let timestamp = '' + tmp_current_fullyear + '-' + tmp_current_month + '-' + tmp_current_day + ' ' + tmp_current_hours + ':' + tmp_current_minutes;
  return timestamp;
};

/* get the date (yyyy-mm-dd) out of timestamp */
function get_date_from_timestamp(timestamp) {
  let timestamp_array = timestamp.split(" ");
  let date = timestamp_array[0];
  return date;
};

/* get the date (hh:mm) out of timestamp */
function get_time_from_timestamp(timestamp) {
  let timestamp_array = timestamp.split(" ");
  let time = timestamp_array[1];
  return time;
};

/* get data from last message sent by _sender */
function get_data_from_last_message(_sender) {

  let chat_id = get_active_chat();

  let chat_item_json = JSON.parse(localStorage.getItem(chat_id));
  let bot_id = chat_item_json['bot_id'];
  let chat_history_array = chat_item_json['chat_history'];
  let last_chat_history_item_index = chat_history_array.length - 1;

  let last_chat_history_item_action_id = '';
  let last_chat_history_item_action_type = '';
  let last_chat_history_item_timestamp = '';
  let last_chat_history_item_action_content = '';
  let last_chat_history_item_sender = '';

  // chat_id, bot_id, action_id, action_type, timestamp, message, sender
  let return_array = [];
  return_array.push(chat_id);
  return_array.push(bot_id);

  /* if (_sender === 'visitor') {
    // get data from last item in chat_history sent by the operator
    let is_visitor = false;
    while (!is_visitor) {
      last_chat_history_item_sender = String(chat_item_json['chat_history'][last_chat_history_item_index]['sender']);

      if (last_chat_history_item_sender === 'visitor') {
        is_visitor = true;
        last_chat_history_item_action_id = String(chat_item_json['chat_history'][last_chat_history_item_index]['action_id']);
        last_chat_history_item_action_type = String(chat_item_json['chat_history'][last_chat_history_item_index]['action_type']);
        last_chat_history_item_timestamp = String(chat_item_json['chat_history'][last_chat_history_item_index]['timestamp']);
        last_chat_history_item_action_content = String(chat_item_json['chat_history'][last_chat_history_item_index]['content']);
        last_chat_history_item_action_sender = String(chat_item_json['chat_history'][last_chat_history_item_index]['sender']);


        return_array.push(last_chat_history_item_action_id);
        return_array.push(last_chat_history_item_action_type);
        return_array.push(last_chat_history_item_timestamp);
        return_array.push(last_chat_history_item_action_content);
        return_array.push(last_chat_history_item_action_sender);

      } else {
        last_chat_history_item_index -= 1;
      }
    }

    return return_array;

  } else */
  if (_sender === 'operator') {
    // get data from last item in chat_history sent by the operator
    let is_operator = false;
    while (!is_operator) {
      last_chat_history_item_sender = String(chat_item_json['chat_history'][last_chat_history_item_index]['sender']);

      if (last_chat_history_item_sender === 'operator') {
        is_operator = true;
        last_chat_history_item_action_id = String(chat_item_json['chat_history'][last_chat_history_item_index]['action_id']);
        last_chat_history_item_action_type = String(chat_item_json['chat_history'][last_chat_history_item_index]['action_type']);
        last_chat_history_item_timestamp = String(chat_item_json['chat_history'][last_chat_history_item_index]['timestamp']);
        last_chat_history_item_action_content = String(chat_item_json['chat_history'][last_chat_history_item_index]['content']);
        last_chat_history_item_action_sender = String(chat_item_json['chat_history'][last_chat_history_item_index]['sender']);


        return_array.push(last_chat_history_item_action_id);
        return_array.push(last_chat_history_item_action_type);
        return_array.push(last_chat_history_item_timestamp);
        return_array.push(last_chat_history_item_action_content);
        return_array.push(last_chat_history_item_action_sender);

      } else {
        last_chat_history_item_index -= 1;
      }
    }

    return return_array;

  } else {
    console.error('_sender error!');
  }
};

/* dev and debugging only --------------------------------------------------- */
/* logging data */
function log_chat() {
  let chat_id = get_active_chat();
  console.log(JSON.parse(localStorage.getItem(chat_id))['chat_history']);
};

function log_specific_chat(chat_id) {
  console.log(JSON.parse(localStorage.getItem(chat_id)));
};

function test_add_chat() {
  localStorage.setItem('ci:e6fd8330-05e7-4e88-a1b5-a77d6ee8359e', JSON.stringify({
    'chat_id': 'ci:e6fd8330-05e7-4e88-a1b5-a77d6ee8359e',
    'bot_id': '4200',
    'chat_history': [{
        'action_id': '111',
        'action_type': 'message',
        'timestamp': '2022-07-07 20:32',
        'content': 'Hey',
        'sender': 'operator'
      },
      {
        'action_id': '111',
        'action_type': 'message',
        'timestamp': '2022-07-07 20:32',
        'content': 'Hey',
        'sender': 'visitor'
      },
      {
        'action_id': '444',
        'action_type': 'message',
        'timestamp': '2022-07-07 20:32',
        'content': 'Ho',
        'sender': 'operator'
      }
    ]
  }));

  // add_id_to_chat_ids
  let chats_in_localStorage_array = JSON.parse(localStorage.getItem('chat_ids'))['chats_in_localStorage'];
  chats_in_localStorage_array.push('ci:e6fd8330-05e7-4e88-a1b5-a77d6ee8359e');

  const chat_ids = {
    'chats_in_localStorage': chats_in_localStorage_array
  }

  // add the chat_ids object to the local storage
  localStorage.setItem('chat_ids', JSON.stringify(chat_ids));

  // chat_id, bot_id, welcome_message, action_id, action_type
  set_new_chat('ci:e6fd8330-05e7-4e88-a1b5-a77d6ee8359e', '4200', 'Hey', '111', 'message');

}