//JsSIP.debug.enable('JsSIP:*');
//JsSIP.debug.disable('JsSIP:*');

const domain = 'databranch.site';
const port   = '8089'

var callbtn  = document.getElementById("callbtn");
var exten    = document.getElementById("extension");
var regbtn   = document.getElementById("regbtn");
var phone    = document.getElementById("phone");
var pass     = document.getElementById("pass");
var socket   = new JsSIP.WebSocketInterface('wss://' + domain + ':' + port + '/ws');
var ua       = "";
var sipAudio = new Audio();         

function register() {
  var configuration = {
    sockets  : [ socket ],
    uri      : 'sip:' + phone.value + '@' + domain,
    password : pass.value,
    register : true, 
  };

  ua = new JsSIP.UA(configuration);

  ua.on('connected',    function(e) {
    regbtn.textContent = 'Connected';
    console.log('agent is connected'); });
  ua.on('disconnected', function(e) {
    regbtn.textContent = 'DisConnected';
    console.log('agent is disconnected'); });
  ua.on('registered',   function(e) { 
    regbtn.textContent = 'Registered';
    console.log('agent is registered'); });
  ua.on('unregistered', function(e) { 
    regbtn.textContent = 'UnRegistered';
    console.log('agent is unregistered'); });
  ua.on('sipEvent', function(e) {
    console.log('sipEvent'); });
  ua.on('newRTCSession', function(e) {
    console.log("newRTCSession");
    console.log(e);
    var session = e.session;
    if (session.direction === "incoming") {
      session.on('peerconnection', function(e) {
        console.log("peerconnection");
        e.peerconnection.addEventListener('addstream', function (e) {
          console.log("Stream added");
          sipAudio.srcObject = e.stream;
          sipAudio.play();
        });
      });
      callbtn.textContent = 'Incoming Call';
      var callOptions = {
        mediaConstraints: {
          audio: true, // only audio calls
          video: false
        }
      };
      session.answer(callOptions);
    }
    else {
      session.connection.addEventListener('addstream', function (e) {
        console.log("Stream added");
        sipAudio.srcObject = e.stream;
        sipAudio.play();
      });
    }
    session.on('confirmed',function(e){ console.log("session confirmed"); });
    session.on('failed',   function(e){ console.log("session failed");    });
    session.on('ended',    function(e){
      console.log("session ended"); 
      callbtn.textContent = 'Call';
    });
    session.on('accepted', function(e){ console.log("session accepted");  });
  });
  ua.on('registrationFailed', function(e) {
    regbtn.textContent = 'Register Failed';
    console.log('agent register failed : ' + e.request +  e.response);
  });
  ua.on('sipEvent', function(e) {
    console.log('Sip Event');
    console.log(e);
  });
  ua.on('newMessage', function(e) {
    console.log('New Message');
    console.log(e);
  });
  ua.start();

}

function call() {
  var eventHandlers = {
    'progress': function(e) {
      callbtn.textContent = 'Call in Progress';
      console.log('call is in progress');
    },
    'failed': function(e) {
      callbtn.textContent = 'Call Failed';
      console.log('call failed');
    },
    'ended': function(e) {
      callbtn.textContent = 'Call';
      console.log('call ended');
    },
    'confirmed': function(e) {
      callbtn.textContent = 'Call Confirmed';
      console.log('call confirmed');
    },
  };

  var options = {
    'eventHandlers'    : eventHandlers,
    'mediaConstraints' : { 'audio': true, 'video': false }
  };

  ua.call('sip:' + exten.value + '@' + domain , options);

  callbtn.textContent = 'Dailing';
}