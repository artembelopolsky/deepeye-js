import * as tf from '@tensorflow/tfjs-core';

export async function load_faceapi_fromstring(binaryString){

    // Convert the binary string back to binary data
    var binaryData = atob(binaryString);

    // Create a Uint8Array from the binary data
    var uint8Array = new Uint8Array(binaryData.length);
    for (var i = 0; i < binaryData.length; i++) {
        uint8Array[i] = binaryData.charCodeAt(i);
    }

    // Load model weights using TensorFlow.js (example code)
    const model = await tf.loadLayersModel(tf.io.browserFiles([{
        name: 'model',
        data: uint8Array.buffer
    }]));
    console.log("Model weights loaded in the browser:", model);
    return model
}
