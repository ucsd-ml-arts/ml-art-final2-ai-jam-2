import React, {Component} from 'react';
import './App.css';
import { Model } from './DrumifyModel';
import {MelodyModel} from './MelodyModel';
import WebMidi from 'webmidi';
import Tone from "tone"; 

import Interface from "./interface";

// More Drums

class App extends Component {
  constructor(){
    super();
    this.state = {
      status: 'Loading Models...',
      melodyTemperature: 1.1,
      drumTemperature: 1.1,
      basslinePresent: false,
      drumsPresent: false,
      melodyPresent: false,
      aiMelodyPresent: false
    }
  }

  componentDidMount() {
    this.melodyModel = new MelodyModel();
    this.drumModel = new Model();
    this.drumModel.load().then(() => {
      this.melodyModel.load().then(()=>{
      this.setState({status: "Models Loaded. Waiting for input..."});
    // this.synth = new Tone.Synth({oscillator:{type:"fatsquare"}});
    // this.synth.connect(Tone.Master);
    this.reverb = new Tone.Reverb(10);
    this.reverb.generate().then(() => {
      this.reverb.connect(Tone.Master);
    });
    // this.synth = new Tone.PolySynth(6);//{oscillator:{type:"fatsquare"}});
    // // this.synth.connect(this.reverb);
    // let vibrato = new Tone.Vibrato(4, 0.25);
    // vibrato.connect(this.reverb);
    // vibrato.connect(Tone.Master)
    // this.synth.connect(vibrato);    
    // this.synth.set({"oscillator": {"type": "fatsquare"}});
    this.synth = new Tone.FMSynth({modulationIndex: 15,modulationEnvelope: {attack:0.1, decay: 0.1}});
    this.synth.connect(Tone.Master);
    this.synth.connect(this.reverb);

    this.basslineSynth = new Tone.FMSynth({modulationIndex: 15,modulationEnvelope: {attack:0.1, decay: 0.1}});
    this.basslineSynth.connect(Tone.Master);
    this.basslineSynth.connect(this.reverb);


    this.melodySynth = new Tone.Synth({oscillator:{type:"fatsquare"}});
    this.melodySynth.connect(Tone.Master);
    this.melodySynth.connect(this.reverb);
    
    let aiVibrato = new Tone.Vibrato(4, 0.25);
    aiVibrato.connect(this.reverb);
    aiVibrato.connect(Tone.Master)
    this.aiSynth = new Tone.Synth({oscillator:{type:"amsawtooth"}});
    this.aiSynth.connect(aiVibrato)
    // this.aiSynth.connect(Tone.Master);
    // this.aiSynth.connect(this.reverb);

    this.metroPlayer = new Tone.Player({url: "./metronome.mp3"})
    this.metroVolume = new Tone.Volume(-5);
    this.metroPlayer.chain(this.metroVolume, Tone.Master)      ;
    // this.metroVolume.mute = true;
    // this.metro = Tone.Transport.scheduleRepeat(time => {
    //     if(this.metroPlayer.loaded){
    //       this.metroPlayer.start(time);
    //     }
    //   }, "4n");
      // Tone.Transport.start();

    Tone.context.lookAhead = 0;
    this.kickVolume = new Tone.Volume(0);
    this.kick = new Tone.Player({url: "./kick.wav"}).chain(this.kickVolume, Tone.Master);
    this.snareVolume = new Tone.Volume(0);
    this.snare = new Tone.Player({url: "./snare.wav"}).chain(this.snareVolume, Tone.Master);
    this.closedHatVolume = new Tone.Volume(0);
    this.closedHat = new Tone.Player({url: "./closed_hat.wav"}).chain(this.closedHatVolume, Tone.Master);
    this.openHatVolume = new Tone.Volume(0);
    this.openHat = new Tone.Player({url: "./open_hat.wav"}).chain(this.openHatVolume, Tone.Master);
    this.clapVolume = new Tone.Volume(0);
    this.clap = new Tone.Player({url: "./clap.wav"}).chain(this.clapVolume, Tone.Master);
    this.highTomVolume = new Tone.Volume(0);
    this.highTom = new Tone.Player({url: "./high-tom.wav"}).chain(this.highTomVolume, Tone.Master);
    this.lowTomVolume = new Tone.Volume(0);
    this.lowTom = new Tone.Player({url: "./low-tom.wav"}).chain(this.lowTomVolume, Tone.Master);        
    this.crashVolume = new Tone.Volume(0);
    this.crash = new Tone.Player({url: "./crash.wav"}).chain(this.crashVolume, Tone.Master); 
    this.rideVolume = new Tone.Volume(0);
    this.ride = new Tone.Player({url: "./ride.wav"}).chain(this.rideVolume, Tone.Master); 
    this.midTomVolume = new Tone.Volume(0);
    this.midTom = new Tone.Player({url: "./mid-tom.wav"}).chain(this.midTomVolume, Tone.Master);     
    this.notes = [];
    this.kickAdd = false;
    this.bassline = [];
    this.melodyNotes = [];
    this.aiNotes = [];
    this.recording = false;
    this.start = false;
    this.firstDrumsGeneration = true;
    this.drumAdds = false;
    this.changeSynth = false;

    WebMidi.enable((err)=>{
      if (err) {
        console.log("WebMidi could not be enabled.", err);
      } else {
        console.log("WebMidi enabled!");
      }
      let input = WebMidi.inputs[0];
      input.addListener('noteon', "all", this.onNoteDown);
      input.addListener('noteoff', "all", this.onNoteUp);
      input.addListener('controlchange', "all", this.onControlChange);

    });
    this.start = true;
    });
  });
    Tone.Transport.bpm.value = 120;

  }

  onNoteDown=e=>{
    if(Tone.Transport.state === "stopped"){
      this.setState({status: "Input"});
    }
    if(this.recording){
      if(this.start){
        this.start = false;
        Tone.Transport.position = 0;
        Tone.Transport.start();
        // this.metroVolume.mute = true;
      }
    }
    let freq = this.midiToFreq(e.note.number);
    let gain = this.getGain(1 - e.velocity);
    this.synth.triggerAttack(freq);
    this.synth.volume.value = gain;
    this.rawVelocity = e.rawVelocity;
    this.startPosition = Tone.Transport.position;
    this.note = e.note.number;
    let quantizeTime = new Tone.Time(this.startPosition).quantize("16n");
    this.startTime = new Tone.Time(quantizeTime).toBarsBeatsSixteenths() ; 
    this.gain = gain;
  }

  onNoteUp=ev=>{
    if(this.changeSynth){
      let freq = this.midiToFreq(ev.note.number);
      this.synth.triggerRelease(freq);        
    } else {
      this.synth.triggerRelease();
    }

    let endTime = new Tone.Time(Tone.Transport.position).quantize("16n");
    let startTime = new Tone.Time(this.startTime).toSeconds();
    let timeDelta = endTime - startTime;
    if(timeDelta === 0){
      timeDelta = 0.25;
    }
    let endPosition = Tone.Transport.position;
    let s  = this.startPosition.split(":");
    let e = endPosition.split(":");
    let quantizedStartStep = 16*Number(s[0]) + 4*Number(s[1])+Math.round(Number(s[2]));
    let quantizedEndStep = 16*Number(e[0]) + 4*Number(e[1])+Math.round(Number(e[2]));
    if(quantizedStartStep < 31){
      this.notes.push({
        pitch: this.note,
        quantizedStartStep: quantizedStartStep,
        quantizedEndStep: quantizedEndStep,
        startTime: startTime,
        endTime: endTime,
        duration: timeDelta,
        isDrum: false,
        velocity: this.rawVelocity,
        gain: this.gain,
        time: this.startTime,
        transportStartTime: this.startPosition
      })
    }
    console.log(this.notes)
  }

  onControlChange = e =>{
    console.log("CONTROL", e.controller.number)
    switch(e.controller.number){
      case 51:
        if (e.value) {
          // Add/Remove kick
          if(this.kickAdd){
            Tone.Transport.clear(this.kickLoop)
            this.kickAdd = false;
          } else {
            this.kickAdd = true;
            Tone.Transport.stop();
            this.kickLoop = Tone.Transport.scheduleRepeat(time => {
              this.kick.start(time);
              this.kickVolume = this.getGain(1 - 100/ 128);
            }, "4n")
            Tone.Transport.start();
          }
        }
      break;
      case 52:
        // Add Drums together
        if (e.value) {
          this.drumAdds = !this.drumAdds;
        }
      break;
      case 112:
        // Record Melody
        if (e.value) {
          // this.recordMelody();
          this.melodySave = true;
        }          
      break;
      
      case 113:
        if (e.value) {
          // Generate New Melody
          if(this.melodyNotes.length){
            this.notes = this.melodyNotes
          }
          if (this.aiNotes.length) {
            this.notes = this.aiNotes.map(note=>{
              return {
                ...note, 
                pitch:note.pitch-12
              }
              });
          }
          this.recording = false;
          Tone.Transport.stop();
          Tone.Transport.cancel();
          if (this.part) this.part.stop();
          if (this.basslinePart) this.basslinePart.stop();
          let newMelodyTemperature = this.state.melodyTemperature - 0.1;
          if (newMelodyTemperature < 0.2) {
            newMelodyTemperature = 1.1;
          }
          this.setState({status: "Generating New Melody", melodyTemperature: newMelodyTemperature})
          this.createSequence(true).then(out=>{
            console.log(out.notes)
            this.setState({aiMelodyPresent: true, status: "Looping All Elements"})
            this.aiNotes = out.notes.map(note=>{
              let timeDelta = note.endTime - note.startTime;
              let startTime = new Tone.Time(note.startTime).toBarsBeatsSixteenths();
              if(timeDelta === 0){
                timeDelta = 0.25;
              }              
              return {
                ...note,
                pitch: note.pitch+12,
                time: startTime,
                duration: timeDelta,
                gain: -1 * Math.random()*10
              }
            });
            this.playDrumsAndSequence(true);
          });         
          this.melodyGenerated = true;

        }        
      break;
      case 114:
        if(e.value){
          // Stop
          this.recording = false;
          this.newSequence = false;
          Tone.Transport.stop();
          Tone.Transport.loop = false; 
          if(this.part) this.part.stop();
          if(this.basslinePart) this.basslinePart.stop();
          this.setState({
            status: 'Input',
            melodyTemperature: 1.1,
            drumTemperature: 1.1,
            basslinePresent: false,
            drumsPresent: false,
            melodyPresent: false,
            aiMelodyPresent: false
          });
          Tone.Transport.cancel();
          this.melodyGenerated = false;
          this.melodySave = false;
          this.kickAdd = false;
          this.drumAdds = false;
          this.firstDrumsGeneration= true;
          this.changeSynth = false;
          this.notes = [];
          this.bassline = [];
          this.melodyNotes = [];
          this.aiNotes = [];
          this.synth = new Tone.FMSynth({modulationIndex: 15,modulationEnvelope: {attack:0.1, decay: 0.1}});
          this.synth.connect(Tone.Master);
          this.synth.connect(this.reverb);

        }
        break;
      case 116:
        if(e.value){
          // Drums Generation
          this.kickAdd = false;
          if(this.firstDrumsGeneration){
            this.bassline = this.notes;
            this.firstDrumsGeneration = false;
          }
          let newDrumTemperature = this.state.drumTemperature - 0.1;
          if (newDrumTemperature < 0.2) {
            newDrumTemperature = 1.1;
          }
          this.setState({status: "Generating Drums...", drumTemperature: newDrumTemperature});
          if(this.bassline.length){
            this.notes = this.bassline;
          }
          this.recording = false;
          Tone.Transport.stop();
          if (this.part) this.part.stop();
          if (this.basslinePart) this.basslinePart.stop();
          if(!this.drumAdds){
            Tone.Transport.cancel();
          }
          this.metro = Tone.Transport.scheduleRepeat(time => {
            if (this.metroPlayer.loaded) {
              this.metroPlayer.start(time);
            }
          }, "4n");

          this.createSequence(false).then(out=>{
            this.changeSynth = true;
            // this.synth.disconnect(Tone.Master);
            // this.synth.disconnect(this.reverb);
            this.synth = new Tone.PolySynth(6);//{oscillator:{type:"fatsquare"}});
            // this.synth.connect(this.reverb);
            let vibrato = new Tone.Vibrato(4, 0.25);
            vibrato.connect(this.reverb);
            vibrato.connect(Tone.Master)
            this.synth.connect(vibrato);    
            this.synth.set({"oscillator": {"type": "fatsquare"}});

            console.log(out.notes)
            this.drumNotes = out.notes;
            this.setState({drumsPresent: true, status: "Playing Drums with Sequence"});
            this.playDrumsAndSequence(false);
          });
        }
        break;
      case 117:
        // Recording
        if(e.value){
          this.record()
        }

        break;
        default:
    }
  }

  record(){
    this.recording = true;
    // this.metroVolume.mute = false;
    this.notes = [];
    this.bassline = [];
    this.start = true;
    this.setState({ status: "Recording Bassline..." })
    this.metro = Tone.Transport.scheduleRepeat(time => {
      if (this.metroPlayer.loaded) {
        this.metroPlayer.start(time);
      }
    }, "4n");
    Tone.Transport.start();
    Tone.Transport.position = 0;

    this.loop = Tone.Transport.scheduleRepeat(time=>{
      if(this.notes.length){
        Tone.Transport.cancel();
        Tone.Transport.setLoopPoints(0, "2m");
        Tone.Transport.loop = true;  
        Tone.Transport.stop();
        this.playRecording();

      }
    }, "2m")

  }

  playRecording(){
    this.part = new Tone.Part((time, value)=> {
      this.basslineSynth.triggerAttackRelease(this.midiToFreq(value.pitch), value.duration, time);
      this.basslineSynth.volume.value = value.gain;
    }, this.notes);
    this.metro = Tone.Transport.scheduleRepeat(time => {
      if (this.metroPlayer.loaded) {
        this.metroPlayer.start(time);
      }
    }, "4n");
    this.part.start(0);
    Tone.Transport.start();
    Tone.Transport.position = 0;
    this.setState({basslinePresent: true, status: "Looping Bassline"});
  }

  async createSequence(melody){
    const sequence = {
        timeSignatures: [{
          time: 0,
          numerator: 4,
          denominator: 4
        }],
        quantizationInfo: {stepsPerQuarter: 4},
        tempos: [{
          time: 0,
          qpm: 120
        }],
        totalQuantizedSteps: 32,
        notes: this.notes
     }
     console.log(this.notes)
    
    if (melody){
      return await this.melodyModel.predict(sequence, this.state.melodyTemperature)
    }
    return await this.drumModel.drumify(sequence, this.state.drumTemperature);
  }

  playDrumsAndSequence(ai){
        this.basslinePart = new Tone.Part((time, value) => {
          this.basslineSynth.triggerAttackRelease(this.midiToFreq(value.pitch), value.duration, time);
          this.basslineSynth.volume.value = value.gain;
        }, this.bassline);
        this.basslinePart.start(0);
       if(this.aiNotes) {
        this.aiPart = new Tone.Part((time, value) => {
          this.aiSynth.triggerAttackRelease(this.midiToFreq(value.pitch), value.duration, time);
          this.aiSynth.volume.value = value.gain;
        }, this.aiNotes);
        this.aiPart.start(0);

        this.melody = new Tone.Part((time, value) => {
          this.melodySynth.triggerAttackRelease(this.midiToFreq(value.pitch), value.duration, time);
          this.melodySynth.volume.value = value.gain;
        }, this.melodyNotes);
        this.melody.start(0);
      }
      
    this.drumNotes.forEach(note => {
      if(note.startTime > 4){
        note.startTime = note.startTime - 2;
      } 
      if (note.startTime < 0) {
        note.startTime = note.startTime + 2;
      }
      if(note.endTime > 4){
        note.endTime = note.endTime - 2;
      } 
      if (note.endTime < 0) {
        note.endTime = note.endTime + 2;
      }
      
      switch(note.pitch){
        case 36:
          Tone.Transport.schedule(time=>{
            this.kick.start(time);
            this.kickVolume = this.getGain(1-note.velocity/128);
          }, note.startTime)                
          break;
        case 38:
          Tone.Transport.schedule(time => {
            this.snare.start(time);
            this.snareVolume = this.getGain(1 - note.velocity / 128);
          }, note.startTime)
            break;
        case 39:
          Tone.Transport.schedule(time => {
            this.clap.start(time);
            this.clapVolume = this.getGain(1 - note.velocity / 128);
          }, note.startTime)
        break;
        case 42:
          Tone.Transport.schedule(time => {
            this.closedHat.start(time);
            this.closedHatVolume = this.getGain(1 - note.velocity / 128);
          }, note.startTime);
          break;
        case 45:
          Tone.Transport.schedule(time => {
            this.lowTom.start(time);
            this.lowTomVolume = this.getGain(1 - note.velocity / 128);
          }, note.startTime);
        break;
        case 46:
          Tone.Transport.schedule(time => {
            this.openHat.start(time);
            this.openHatVolume = this.getGain(1 - note.velocity / 128);
          }, note.startTime);
          break;
        case 48:
          Tone.Transport.schedule(time => {
            this.midTom.start(time);
            this.midTomVolume = this.getGain(1 - note.velocity / 128);
          }, note.startTime);
        break;
        case 49:
          Tone.Transport.schedule(time => {
            this.crash.start(time);
            this.crashVolume = this.getGain(1 - note.velocity / 128);
          }, note.startTime);
        break;
        case 50:
          Tone.Transport.schedule(time => {
            this.highTom.start(time);
            this.highTomVolume = this.getGain(1 - note.velocity / 128);
          }, note.startTime);
        break;
        case 51:
          Tone.Transport.schedule(time => {
            this.ride.start(time);
            this.rideVolume = this.getGain(1 - note.velocity / 128);
          }, note.startTime);
        break;
          default:
        }
    })
    this.melodySaveLoop = Tone.Transport.scheduleRepeat(time=>{
      if(this.melodySave){
        this.playMelody();
        this.melodySave = false;
      } else {
        this.notes = [];
      }
    }, "0")
    Tone.Transport.start();
  }

  playMelody(){
    this.setState({melodyPresent: true, status: "Looping Melody"});
    Tone.Transport.stop();
    Tone.Transport.clear(this.melodySaveLoop);
    this.melodyNotes = this.notes;
    this.melody = new Tone.Part((time, value) => {
      this.melodySynth.triggerAttackRelease(this.midiToFreq(value.pitch), value.duration, time);
      this.melodySynth.volume.value = value.gain;
    }, this.notes);
    this.melodySaveLoop = Tone.Transport.scheduleRepeat(time => {
      if (this.melodySave) {
        this.melody.stop();
        this.playMelody();
        this.melodySave = false;
      } else {
        this.notes = [];
      }
    }, "0")
    this.melody.start(0);
    Tone.Transport.start();
  }

  midiToFreq(midi) {
    return Math.pow(2, ((midi - 69) / 12)) * 440;
  }

  getGain(index) {
    //1 t0 0 ->
    //-10 to 0dB
    return -1 * (index * 10);
  }

  render(){
    return (
      <div className="App">
        <Interface
        status={this.state.status}
        drumTemperature={this.state.drumTemperature}
        melodyTemperature={this.state.melodyTemperature}
        drums={this.state.drumsPresent}
        melody={this.state.melodyPresent}
        aiMelody={this.state.aiMelodyPresent}
        bassline={this.state.basslinePresent}
        />
      </div>
    );
  }
}

export default App;
