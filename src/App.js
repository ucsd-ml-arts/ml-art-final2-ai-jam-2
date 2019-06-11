import React, {Component} from 'react';
import './App.css';
import { Model } from './DrumifyModel';
import {MelodyModel} from './MelodyModel';
import WebMidi from 'webmidi';
import * as mm from '@magenta/music';

import Tone from "tone"; 
// var fs = require('fs')
const temp = 0.5;
class App extends Component {
  constructor(){
    super();
    this.state = {
      mode: 'Input'
    }
  }
  componentDidMount() {
    this.melodyModel = new MelodyModel();
    this.drumModel = new Model();
    this.drumModel.load().then(() => {
      // setStatus('')

    this.synth = new Tone.Synth({oscillator:{type:"fatsquare"}});
    this.synth.connect(Tone.Master);

    this.playbackSynth = new Tone.Synth({oscillator:{type:"fatsquare"}});
    this.playbackSynth.connect(Tone.Master);

    this.melodySynth = new Tone.Synth({oscillator:{type:"fatsquare"}});
    this.melodySynth.connect(Tone.Master);
    // this.playbackSynth.sync();

    this.aiSynth = new Tone.Synth({oscillator:{type:"triangle"}});
    this.aiSynth.connect(Tone.Master);
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
    this.recording = false;
    this.start = false;
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
    Tone.Transport.bpm.value = 120;

  }

  onNoteDown=e=>{
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
    // console.log(this.startPosition)
    this.note = e.note.number;
    // this.startTime = Tone.Transport.progress*4;
    let quantizeTime = new Tone.Time(this.startPosition).quantize("16n");
    this.startTime = new Tone.Time(quantizeTime).toBarsBeatsSixteenths() ; 
    // console.log(this.startTime)
    this.gain = gain;
  }

  onNoteUp=()=>{
    this.synth.triggerRelease();
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
          // Add/Remove drums
          if(this.kickAdd){
            Tone.Transport.clear(this.kickLoop)
            this.kickAdd = false;
          } else {
            this.kickAdd = true;
            Tone.Transport.stop();
            this.kickLoop = Tone.Transport.scheduleRepeat(time => {
              // console.log("hi")
              this.kick.start(time);
              this.kickVolume = this.getGain(1 - 100/ 128);
            }, "4n")
            Tone.Transport.start();
          }
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
          this.recording = false;
          Tone.Transport.stop();
          if (this.part) this.part.stop();
          if (this.playbackPart) this.playbackPart.stop();
          this.setState({mode: "Generating New Melody"})
          this.createSequence(true).then(out=>{
            console.log(out.notes)
            this.aiNotes = out.notes.map(note=>{
              let timeDelta = note.endTime - note.startTime;
              let startTime = new Tone.Time(note.startTime).toBarsBeatsSixteenths();
              if(timeDelta === 0){
                timeDelta = 0.25;
              }
              return {
                ...note,
                time: startTime,
                duration: timeDelta,
                gain: -1 * Math.random()*10
              }
            });
            this.playDrumsAndSequence(true);
          });         
        }        
      break;
      case 114:
        if(e.value){
          this.recording = false;
          this.newSequence = false;
          Tone.Transport.stop();
          Tone.Transport.loop = false; 
          if(this.part) this.part.stop();
          if(this.playbackPart) this.playbackPart.stop();
          this.setState({mode: "Stopped"});
          Tone.Transport.cancel();

        }
        break;
      case 116:
        if(e.value){
          // Drums Generation
          this.bassline = this.notes;
          this.recording = false;
          Tone.Transport.stop();
          if (this.part) this.part.stop();
          if (this.playbackPart) this.playbackPart.stop();
          this.setState({mode: "Training"})
          this.createSequence(false).then(out=>{
            console.log(out.notes)
            this.drumNotes = out.notes;
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
    this.setState({ mode: "Recording" })
    // Tone.Transport.setLoopPoints(0, "2m");
    // Tone.Transport.loop = true;    
    this.metro = Tone.Transport.scheduleRepeat(time => {
      if (this.metroPlayer.loaded) {
        this.metroPlayer.start(time);
      }
    }, "4n");
    Tone.Transport.start();
    Tone.Transport.position = 0;

    this.loop = Tone.Transport.schedule(time=>{
      Tone.Transport.setLoopPoints(0, "2m");
      Tone.Transport.loop = true;  
      Tone.Transport.stop();
      this.playRecording();
    }, "2m")

  }

  playRecording(){
    this.part = new Tone.Part((time, value)=> {
      this.playbackSynth.triggerAttackRelease(this.midiToFreq(value.pitch), value.duration, time);
      this.playbackSynth.volume.value = value.gain;
    }, this.notes);
    this.part.start(0);
    Tone.Transport.start();
    Tone.Transport.position = 0
    // console.log(this.notes)
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
    
    if (melody){
      return await this.melodyModel.predict(sequence)
    }
    return await this.drumModel.drumify(sequence, 1);
  }

  playDrumsAndSequence(ai){
        this.playbackPart = new Tone.Part((time, value) => {
          this.playbackSynth.triggerAttackRelease(this.midiToFreq(value.pitch), value.duration, time);
          this.playbackSynth.volume.value = value.gain;
        }, this.bassline);
        this.playbackPart.start(0);
       if(this.aiNotes) {
        this.aiPart = new Tone.Part((time, value) => {
          this.aiSynth.triggerAttackRelease(this.midiToFreq(value.pitch), value.duration, time);
          this.aiSynth.volume.value = value.gain;
        }, this.aiNotes);
        this.aiPart.start(0);
      }
    this.drumNotes.forEach(note => {
      if(note.startTime || note.endTime > 4){
        note.startTime = note.startTime - 4;
        note.endTime = note.endTime - 4;
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
      }
      this.notes = [];
    }, "0")
    Tone.Transport.start();
  }

  playMelody(){
    Tone.Transport.stop();
    Tone.Transport.clear(this.melodySaveLoop);
    this.melody = new Tone.Part((time, value) => {
      this.melodySynth.triggerAttackRelease(this.midiToFreq(value.pitch), value.duration, time);
      this.melodySynth.volume.value = value.gain;
    }, this.notes);
    this.melody.start(0);
    Tone.Transport.start();
  }


  playDrums(notes){
    let player = new mm.Player();
    // let player = new mm.SoundFontPlayer('https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus');
    player.start(notes)
  
    // console.log(this.player)
  }

  midiToFreq(midi) {
    return Math.pow(2, ((midi - 69) / 12)) * 440;
  }

  getGain(index) {
    //1 t0 0 ->
    //-30 to 0dB
    return -1 * (index * 10);
  }
  render(){
    return (
      <div className="App">
        {this.state.mode}
      </div>
    );
  }
}

export default App;
