/*
Author Laurens Stuurman 10-023

Script for converting the face api models to a different format. 

Plan is to use tf checkpoint to binary file. Then in the bundle read that to javascript as a string and load from there again. 

*/

// const tf = require('@tensorflow/tfjs-node');
// import * as faceapi from '../src/lib/face-api.js';
import * as faceapi from 'face-api.js';
import '@tensorflow/tfjs-node';
import path from 'path';

// Import a fetch implementation for Node.js
import fetch from 'node-fetch';

// Make face-api.js use that fetch implementation
faceapi.env.monkeyPatch({ fetch: fetch });

// const MODELS_URL = path.join(__dirname, '/../src/models');

await faceapi.nets.tinyFaceDetector.loadFromDisk('../src/models').then(async()=> {
    getMethods = (obj) => Object.getOwnPropertyNames(obj).filter(item => typeof obj[item] === 'function')
    console.log(getMethods(faceapi.nets.tinyFaceDetector))
    
    const saveResult = await faceapi.nets.tinyFaceDetector.save('file://testmodel/test');
})
