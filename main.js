const startBtn = document.getElementById("start");
var parrotSvg = null;

var mediaStream;
var micNode;
var plappertier;

window.onload = () => {
  parrotSvg = document.getElementById("parrot-object").contentDocument.getElementById("parrot");
  parrotSvg.pauseAnimations();
  parrotSvg.setCurrentTime(0); 
}

async function startAudio() {
  console.log("starting");
  const audioContext = new AudioContext();
  // input node: microphone
  mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
  micNode = audioContext.createMediaStreamSource(mediaStream);
  // processing node: audio worklet from plappertier.js
  await audioContext.audioWorklet.addModule('plappertier.js');
  plappertier = new AudioWorkletNode(audioContext, 'plappertier');

  plappertier.port.onmessage = (message) => {
    if (message.data == "playing") {
      parrotSvg.unpauseAnimations();
    }
    else {
      parrotSvg.pauseAnimations();
      parrotSvg.setCurrentTime(0);
    }
  }

  // microphone -> plappertier -> loudspeaker
  micNode.connect(plappertier).connect(audioContext.destination);

  // update button
  startBtn.textContent = "stop";
  startBtn.onclick = stopAudio;
};

async function stopAudio() {
  console.log("stopping");
  // stop streams, disconnect Nodes
  mediaStream.getTracks().forEach(track => track.stop());
  micNode.disconnect();
  plappertier.disconnect();

  // update button
  startBtn.textContent = "start";
  startBtn.onclick = startAudio;
}

startBtn.onclick = startAudio;
