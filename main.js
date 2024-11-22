const startBtn = document.getElementById("start");
var parrotSvg = null;

window.onload = () => {
  parrotSvg = document.getElementById("parrot-object").contentDocument.getElementById("parrot");
  parrotSvg.pauseAnimations();
  parrotSvg.setCurrentTime(0); 
}
const maxLengthSecondsSlider = document.getElementById("maxLengthSecondsSlider");
const levelThresholdSlider = document.getElementById("levelThresholdSlider");
const silenceTimeoutSecondsSlider = document.getElementById("silenceTimeoutSecondsSlider");

const startAudio = async (context) => {
  // input node: microphone
  let mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});
  let micNode = context.createMediaStreamSource(mediaStream);
  // processing node: audio worklet from labertier.js
  await context.audioWorklet.addModule('labertier.js');
  const labertier = new AudioWorkletNode(context, 'labertier');
  // parameters
  const maxLengthSeconds = labertier.parameters.get('maxLengthSeconds');
  maxLengthSecondsSlider.min = maxLengthSecondsSlider.minValue;
  maxLengthSecondsSlider.max = maxLengthSeconds.maxValue;
  maxLengthSecondsSlider.value = maxLengthSeconds.defaultValue;
  maxLengthSecondsSlider.onchange = updateMaxLengthSeconds;
  function updateMaxLengthSeconds() {
    maxLengthSeconds.setValueAtTime(maxLengthSecondsSlider.value, context.currentTime);
    maxLengthSecondsLabel.textContent = maxLengthSecondsSlider.value + " s";
  }
  updateMaxLengthSeconds();
  const levelThreshold = labertier.parameters.get('levelThreshold');
  levelThresholdSlider.min = levelThresholdSlider.minValue;
  levelThresholdSlider.max = levelThreshold.maxValue;
  levelThresholdSlider.value = levelThreshold.defaultValue;
  levelThresholdSlider.onchange = updateLevelThreshold;
  function updateLevelThreshold() {
    levelThreshold.setValueAtTime(levelThresholdSlider.value, context.currentTime);
    levelThresholdLabel.textContent = levelThresholdSlider.value;
  }
  updateLevelThreshold();
  const silenceTimeoutSeconds = labertier.parameters.get('silenceTimeoutSeconds');
  silenceTimeoutSecondsSlider.min = silenceTimeoutSecondsSlider.minValue;
  silenceTimeoutSecondsSlider.max = silenceTimeoutSeconds.maxValue;
  silenceTimeoutSecondsSlider.value = silenceTimeoutSeconds.defaultValue;
  silenceTimeoutSecondsSlider.onchange = updateSilenceTimeoutSeconds;
  function updateSilenceTimeoutSeconds() {
    silenceTimeoutSeconds.setValueAtTime(silenceTimeoutSecondsSlider.value, context.currentTime);
    silenceTimeoutSecondsLabel.textContent = silenceTimeoutSecondsSlider.value + " s";
  }
  updateSilenceTimeoutSeconds();

  labertier.port.onmessage = (message) => {
    console.log(message);
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
