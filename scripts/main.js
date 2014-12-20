requirejs.config({
  paths: {
    'Leap': '../lib/leap-0.6.4',
    'jQuery' : '../lib/jquery-1.11.0.min',
    'TweenMax' : '../lib/TweenMax.min',
  },
  shim: {
    'Leap': {
      'exports': 'Leap'
    },
    'jQuery' : {
      'exports' : 'jQuery'
    },
    'TweenMax' : {
      'exports' : 'TweenMax'
    }
  }
});

require(['Leap', 'jQuery', 'TweenMax', 'require', 'utils'], function(Leap, jQuery, TweenMax, require, utils) {
  'use strict';

  var controller = new Leap.Controller({
    enableGestures: true,
    frameEventName: 'animationFrame'
  });

  controller.connect();

  // ====================
  // CONTROLLER LISTENERS
  // ====================

  var hand, finger;

  controller.on('frame', function(frame) {

    var hand = frame.hands[0];

    if (hand) {

        var pos = utils.LeapToScene(frame, hand.palmPosition);
        var fingerPos = hand.fingers[0];
        var indexPos = utils.LeapToScene(frame, fingerPos.tipPosition);

        $('#ballz').css({
          'left' : indexPos.x + 'px',
          'top' : indexPos.y + 'px',
        });

      }

  });


  var beat = 150;
  var oneBeat = 0.4;
  var countBeat = 0;
  var context = new AudioContext;
  var wobblePlaying = false;
  var bassPlaying = false;
  var beatPlaying = false;
  var melodyPlaying = false;
  var queueWobble = [];
  var queueBass = [];
  var actualBeat = 0;
  var nextBeat = 0;
  var actualMelody = 0;
  var nextMelody = 0;
  var sourceMelody;
  var sourceBeat;
  var windowHeight = $(window).height();
  var windowWidth = $(window).width();

  $('.wobble-scale').each(function(index, value){

    var step = windowHeight*0.083;

     $(this).css({
      'top' : step*index
    })

  })

  $('.bass-scale').each(function(index, value){

    var step = windowHeight*0.083;

     $(this).css({
      'top' : step*index
    })

  })

  $('.beat-zone').each(function(index, value){

    var step = windowHeight*0.083;

     $(this).css({
      'top' : step*index
    })

  })

  $('.melodic-zone').each(function(index, value){

    var step = windowHeight*0.083;

     $(this).css({
      'top' : step*index
    })

  })

  function getWobble(start, end) {
      
      var tStart = start;
      var tEnd = end;
      
      var request = new XMLHttpRequest();
          request.open("GET", 'sounds/wobble.mp3', true);
          request.responseType = "arraybuffer"; // Read as binary data

      // Asynchronous callback
      request.onload = function(){
          
          var data = request.response;
          
          context.decodeAudioData(data, function(buffer){

            var sourceWobble = context.createBufferSource();
            sourceWobble.buffer = buffer;
            sourceWobble.connect(context.destination);
            sourceWobble.start(0, start, 0.8);          

          });
      
      };

      request.send();
  }

  function getBass(start, end) {
      
      var tStart = start;
      var tEnd = end;
      
      var request = new XMLHttpRequest();
          request.open("GET", 'sounds/bass.mp3', true);
          request.responseType = "arraybuffer"; // Read as binary data

      // Asynchronous callback
      request.onload = function(){
          
          var data = request.response;
          
          context.decodeAudioData(data, function(buffer){

            var sourceBass = context.createBufferSource();
            sourceBass.buffer = buffer;
            sourceBass.connect(context.destination);
            sourceBass.start(0, start, 0.8);          

          });
      
      };

      request.send();
  }

  function getBeat(number) {
    
      var request = new XMLHttpRequest();
          request.open("GET", 'sounds/beat'+number+'.mp3', true);
          request.responseType = "arraybuffer"; // Read as binary data

      // Asynchronous callback
      request.onload = function(){
          
          var data = request.response;
          
          context.decodeAudioData(data, function(buffer){

            sourceBeat = context.createBufferSource();
            sourceBeat.buffer = buffer;
            sourceBeat.connect(context.destination);
            sourceBeat.start(0, 0, 6.4);   
            beatPlaying = false;       

          });
      
      };

      request.send();
  }

  function getMelody(number){

    var request = new XMLHttpRequest();
        request.open("GET", 'sounds/melody'+number+'.mp3', true);
        request.responseType = "arraybuffer"; // Read as binary data

      // Asynchronous callback
      request.onload = function(){
          
          var data = request.response;
          
          context.decodeAudioData(data, function(buffer){

            sourceMelody = context.createBufferSource();
            sourceMelody.buffer = buffer;
            sourceMelody.connect(context.destination);
            sourceMelody.start(0, 0, 6.4);
            melodyPlaying = false;       
          });
      
      };

      request.send();

  }

  function addQueue(type, note, start, end, number){


    var selector; 
    var queue;

    switch(type){

      case 'wobble' :

      if(queueWobble.length==8){ return false; }

        selector = '#wobble-queue';
        queue = queueWobble;

      break;

      case 'bass' : 

        if(queueBass.length==8){ return false; }

        selector = '#bass-queue';
        queue = queueBass;

      break;

    }

    $(selector).append('<li>'+note+'</li>');

    queue.push({
      'start' : start,
      'end' : end,
    })

  };

  $('.clear-left').on('click',function(){

    wobblePlaying=false;
    queueWobble=[];
    $('#wobble-queue > li').remove();

  })

  $('.clear-right').on('click',function(){

    wobblePlaying=false;
    queueWobble=[];
    $('#bass-queue > li').remove();

  })

  controller.on('gesture',function(gesture){

    if(gesture.type=="screenTap" || gesture.type =='keyTap'){

      var cursorPos = {
        x : parseInt($('#ballz').css('left')),
        y : parseInt($('#ballz').css('top')),
      };

      var stepTop = 0.083;
      var stepNote = 0.8;
      var notes = ['do','do#','ré','ré#','mi','fa','fa#','sol','sol#','la','la#','si'];

      if(cursorPos.x >= parseInt(windowWidth*0.45) && cursorPos.x <= parseInt(windowWidth*0.55) && cursorPos.y >= parseInt(windowHeight-(windowHeight*0.083)) && cursorPos.y <= windowHeight ){ 

          wobblePlaying=false;
          queueWobble=[];
          $('#wobble-queue > li').remove();
          $('.clear-left').addClass('sound-playing'); setTimeout(function(){$('.clear-left').removeClass('sound-playing'),1000});

      };

      if(cursorPos.x >= parseInt(windowWidth*0.45) && cursorPos.x <= parseInt(windowWidth*0.55) && cursorPos.y >= parseInt(windowHeight-(windowHeight*0.166)) && cursorPos.y <= parseInt(windowHeight-(windowHeight*0.083)) ){ 

          bassPlaying=false;
          queueBass=[];
          $('#bass-queue > li').remove();
          $('.clear-right').addClass('sound-playing'); setTimeout(function(){$('.clear-right').removeClass('sound-playing'),1000});

      };

      for(var i = 0 ; i < $('.wobble-scale').length ; i++){

        var start = parseFloat((stepNote * i).toFixed(2));
        var end = parseFloat((start + stepNote).toFixed(2));

        var limitBot = parseFloat((stepTop*i).toFixed(2));
        var limitTop = parseFloat((stepTop*(i+1)).toFixed(2));
  
        if(cursorPos.x >= 0 && cursorPos.x <= parseInt(windowWidth*0.2) && cursorPos.y >= parseInt(limitBot*windowHeight) && cursorPos.y <= parseInt(limitTop*windowHeight) ){ $('.wobble-scale').eq(i).addClass('sound-playing'); setTimeout(function(){$('.wobble-scale').removeClass('sound-playing'),1000}); launchWobble(notes[i], start, end);};


      }

      for(var i = 0 ; i < $('.bass-scale').length ; i++){

        var start = parseFloat((stepNote * i).toFixed(2));
        var end = parseFloat((start + stepNote).toFixed(2));

        var limitBot = parseFloat((stepTop*i).toFixed(2));
        var limitTop = parseFloat((stepTop*(i+1)).toFixed(2));
  
        if(cursorPos.x >= parseInt(windowWidth*0.75) && cursorPos.x <= windowWidth && cursorPos.y >= parseInt(limitBot*windowHeight) && cursorPos.y <= parseInt(limitTop*windowHeight) ){ $('.bass-scale').eq(i).addClass('sound-playing'); setTimeout(function(){$('.bass-scale').removeClass('sound-playing'),1000}); launchBass(notes[i], start, end);};

      }

      for(var i = 0 ; i < $('.beat-zone').length ; i++){

        var limitBot = parseFloat((stepTop*i).toFixed(2));
        var limitTop = parseFloat((stepTop*(i+1)).toFixed(2));

        if(cursorPos.x >= parseInt(windowWidth*0.25) && cursorPos.x <= parseInt(windowWidth*0.45) && cursorPos.y >= parseInt(limitBot*windowHeight) && cursorPos.y <= parseInt(limitTop*windowHeight) ){ launchBeat($('.beat-zone').eq(i),i+1) };

      }

      for(var i = 0 ; i < $('.melodic-zone').length ; i++){

        var limitBot = parseFloat((stepTop*i).toFixed(2));
        var limitTop = parseFloat((stepTop*(i+1)).toFixed(2));
        
        if(cursorPos.x >= parseInt(windowWidth*0.55) && cursorPos.x <= parseInt(windowWidth*0.75) && cursorPos.y >= parseInt(limitBot*windowHeight) && cursorPos.y <= parseInt(limitTop*windowHeight) ){ launchMelodic($('.melodic-zone').eq(i),i+1) };

      }

    }

  });

  function launchWobble(note, start, end){

    var type = 'wobble';
    addQueue(type, note, start,end);

  };

  function launchBass(note, start, end){

    var type = 'bass';
    addQueue(type, note, start,end);

  };

  function launchBeat(elem, number){

    $('.beat-zone').removeClass('beat-playing');

    elem.addClass('beat-playing');

    nextBeat = number;

  };

  function launchMelodic(elem, number){

    $('.melodic-zone').removeClass('melodic-playing');
    
    elem.addClass('melodic-playing');

    nextMelody = number;

  };


setInterval(function(){

  if(countBeat < 8){ countBeat++ }else{ countBeat = 1; };

  $('.tempo-indicator').text(countBeat);

  if(queueWobble.length >=8 && !wobblePlaying && countBeat == 1){
    wobblePlaying = true;
  };

  if(queueWobble.length >= 8 && wobblePlaying){

    var nextWobble = queueWobble.shift();
        queueWobble.push(nextWobble);

    var start = nextWobble.start;
    var end = nextWobble.end;

    $('#wobble-queue > li').removeClass('queue-playing');
    $('#wobble-queue > li').eq(countBeat-1).addClass('queue-playing');

    getWobble(start, end);

  }

  if(queueBass.length >=8 && !bassPlaying && countBeat == 1){
    bassPlaying = true;
  };

  if(queueBass.length >= 8 && bassPlaying){

    var nextBass = queueBass.shift();
        queueBass.push(nextBass);

    var start = nextBass.start;
    var end = nextBass.end;

    $('#bass-queue > li').removeClass('queue-playing');
    $('#bass-queue > li').eq(countBeat-1).addClass('queue-playing');

    getBass(start, end);

  }

  if(nextBeat!=0 && !beatPlaying && countBeat == 1){
    beatPlaying = true;
    actualBeat = nextBeat;  
    getBeat(actualBeat);
  }

  if(nextMelody!=0 && !melodyPlaying && countBeat == 1){
    melodyPlaying = true;
    actualMelody = nextMelody;
    getMelody(actualMelody);
  }

},800);

});

