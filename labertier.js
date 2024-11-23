/**
 * A simple bypass node demo.
 *
 * @class BypassProcessor
 * @extends AudioWorkletProcessor
 */
class Labertier extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
     {
        name: "maxLengthSeconds",
        defaultValue: 10,
        minValue: 0,
        maxValue: 60
      },
      {
        name: "levelThreshold",
        defaultValue: 0.1,
        minValue: 0.0,
        maxValue: 1.0
      },
      {
        name: "silenceTimeoutSeconds",
        defaultValue: 0.5,
        minValue: 0.0,
        maxValue: 5.0
      }
    ];
  }

  constructor() {
    super();
    this.buffer = [];
    this.index = 0;
    this.state = "idle";
    this.timer = 0;
    this.timerTimeout = 0;

    this.port.postMessage("idle");
    console.log("Starting Labertier.");
  }

  process(inputs, outputs, parameters) {
    // By default, the node has single input and output.
    const input = inputs[0];
    const output = outputs[0];

    for (let channel = 0; channel < output.length; ++channel) {
      const inputChannel = input[channel];
      const outputChannel = output[channel];
      for (let i = 0; i < inputChannel.length; ++i) {
        if (this.state == "idle") {
          outputChannel[i] = 0.0; // output nothing in idle
          // check threshold
          if (Math.abs(inputChannel[i]) > parameters.levelThreshold[i]) {
            this.state = "recording";
            console.log(this.state);
            this.port.postMessage("recording");
            this.timer = 0;
            this.timerTimeout = parameters.silenceTimeoutSeconds[i] * sampleRate;
          }
        }
        else if (this.state == "recording") {
          // record sample
          this.buffer.push(inputChannel[i]);
          outputChannel[i] = 0.0;
          this.timer++;

          if (Math.abs(inputChannel[i]) > parameters.levelThreshold[i]) {
            this.timer = 0;
          }

          // check for timeout or buffer full
          if (this.timer >= this.timerTimeout || this.buffer.length >= (parameters.maxLengthSeconds[i] * sampleRate)) {
            this.state = "playing";
            console.log(this.state);
            this.port.postMessage("playing");
            this.index = 0;

            // pitch the buffer
            let new_buffer = [];
            for (let j = 0; j < this.buffer.length; ++j) {
              let k = j % 3;
              if (k == 0 || k == 1)
                new_buffer.push(this.buffer[j]);
              else
                new_buffer[-1] = (new_buffer[-1] + this.buffer[j]) / 2;
            }
            this.buffer = new_buffer;
          }
        }
        else if (this.state == "playing") {
          outputChannel[i] = this.buffer[this.index];
          this.index++;
          // when buffer is sent, go back to idle
          if (this.index >= this.buffer.length) {
            this.state = "idle";
            console.log(this.state);
            this.port.postMessage("idle");
            this.index = 0;
            this.buffer = [];
          }
        }
      }
    }

    return true;
  }
}

registerProcessor('labertier', Labertier);
