# Final Project

Matthew Rice, mhrice@ucsd.edu

## Abstract Proposal

For my final project, I will revist the music generation assignment. I would like to create a real-time version of this project, in that I play piano or bassline "licks", and the model will generate drum tracks to "accompany" my licks. Then I will have a separate model generate new licks and then the original model generate new drum tracks to the new rif, creating an AI jam session. This model expands on the idea of using a VAE to generate music by allowing two such instances of these models to generate music for themselves. I will present this work by bringing my audio equipment to class and starting the "jam session" with a couple licks and then allowing the networks to generate new music. 


## Project Report
AI Jam 2 Report.pdf

## Model/Data

There were two models used, both from magenta. \
[Drums](https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/groovae_2bar_humanize) \
[Melody](https://storage.googleapis.com/magentadata/js/checkpoints/music_rnn/melody_rnn)

## Code

All the code for this project is in the src folder on this repo. The main files are: App.js, interface.js, MelodyModel.js, and DrumifyModel.js.

## Results

example.wav - Example audio recording of a jam session. All breaks are for the generation of new drums/melodies. Output website is published at mhrice.github.io/Ai-Jam-2

## Technical Notes

This is a JavaScript implementation of my idea. To replicate, you need [npm](https://nodejs.org/en/).
Then clone this directory and run `npm run install` then `npm run start` to start the dev server.
However, all of the functionality of the process has been mapped specifically for my MIDI controller (Novation Launchkey 49), and other modifications might need to be made to work with other controllers. 

## Reference
Big thanks to the following: \
[Magenta Studio](https://magenta.tensorflow.org/studio/) \
[Magenta.js guide](https://hello-magenta.glitch.me) \
[MIDI Drum Refence](https://www.zendrum.com/resource-site/drumnotes.htm) \
[Web Midi](https://github.com/djipco/webmidi) \
[Tone.js](https://tonejs.github.io) 

