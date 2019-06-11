/**
 * @license
 * Copyright 2018 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { reconstructBySize } from './shared';
// import { resolve } from 'path';

// const modelPath = PRODUCTION ? `${process.resourcesPath}/app/` : '.';
import * as mm from '@magenta/music';

export class Model {
	constructor() {
		const models = [
			// "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/groovae_2bar_tap2drum",
			"https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/groovae_2bar_humanize",

			
			// "https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/groovae_4bar"
		]
        // this.model = new mm.MusicVAE("https://storage.googleapis.com/magentadata/js/checkpoints/music_vae/groovae_2bar_humanize");
        
	// 	const models = [
    //         ''
    //         // 'models/groovae_tap2drum_1bar/model.ckpt-3061.data-00000-of-00001'
    //         // 'models/2bar_humanize/config.json'
	// // 		resolve(modelPath, 'models/groovae_tap2drum_1bar'),
	// // 		resolve(modelPath, 'models/groovae_tap2drum_2bar'),
	// // 		resolve(modelPath, 'models/groovae_tap2drum_3bar'),
    // // 		resolve(modelPath, 'models/groovae_tap2drum_4bar')
    
	// 	];
		this.models = models.map(url => new mm.MusicVAE(url));
	}

	async load() {
		try {
            await this.models.forEach(model=>model.initialize());
		} catch (e){
            console.log(e);
		}
	}

	// async drumify(seq){}

	async drumify(inSeq, temperature=1) {
		return await reconstructBySize(inSeq, this.models, temperature);
	}
}
