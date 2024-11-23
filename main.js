const startBtn = document.getElementById("start");
var parrotSvg = null;

window.onload = () => {
  parrotSvg = document.getElementById("parrot-object").contentDocument.getElementById("parrot");
  parrotSvg.pauseAnimations();
  parrotSvg.setCurrentTime(0); 
}

const startAudio = async (context) => {
  // input node: microphone
  let mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
  let micNode = context.createMediaStreamSource(mediaStream);
  // processing node: audio worklet from labertier.js
  await context.audioWorklet.addModule('labertier.js');
  const labertier = new AudioWorkletNode(context, 'labertier');

  labertier.port.onmessage = (message) => {
    startBtn.textContent = message.data;
    if (message.data == "playing") {
      parrotSvg.unpauseAnimations();
    }
    else {
      parrotSvg.pauseAnimations();
      parrotSvg.setCurrentTime(0);
    }
  }

  // microphone -> labertier -> loudspeaker
  micNode.connect(labertier).connect(context.destination);
};

startBtn.onclick = () => {
  const audioContext = new AudioContext();
  startAudio(audioContext);
}
