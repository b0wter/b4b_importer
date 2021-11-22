#!/usr/bin/env node

import { readdirSync, readFileSync } from 'fs';
import { createRequire } from 'module'

const require = createRequire(import.meta.url);
const vision = require('@google-cloud/vision')
const client = new vision.ImageAnnotatorClient();

const bucket = 'gs://b4b_cards/';
const basePath = '../b4b/docs/img/english/';

function getImageUrls() {
    const filenames = readdirSync('../b4b/docs/img/english/', { withFileTypes: true }).filter(f => f !== 'named');
    return filenames.map(f => bucket + f);
}




function extractDescription(texts) {
  let document = '';
  texts.forEach(text => {
    document += text.description || '';
  });
  return document;
}

async function extractDescriptions(filename, response) {
  if (response.textAnnotations.length) {
    const words = extractDescription(response.textAnnotations);
    return words;
  } else {
    console.log(`${filename} had no discernable text.`);
  }
}

async function getTextFromFiles(inputFiles) {
  // Read all of the given files and provide request objects that will be
  // passed to the Cloud Vision API in a batch request.
  const requests = await Promise.all(
    inputFiles.map(async filename => {
      console.error(` 👉 ${filename}`);
      const content = readFileSync(filename);
      return {
        image: {
          content: content.toString('base64'),
        },
        features: [{type: 'TEXT_DETECTION'}],
      };
    })
  );

  // Make a call to the Vision API to detect text
  const results = await client.batchAnnotateImages({requests});
  const detections = results[0].responses;
  return await Promise.all(
    inputFiles.map(async (filename, i) => {
      const response = detections[i];
      if (response.error) {
        console.info(`API Error for ${filename}`, response.error);
        return;
      }
      const words = await extractDescriptions(filename, response);
      return { file: filename, words: words };
    })
  );
}


async function annotateImage(name) {
    console.log(`Annotaing: ${name}`)
    const [result] = await client.labelDetection(name);
    const texts = result.textAnnotations;

    //console.log(result)
    /*
    const labels = result.labelAnnotations;
    console.log('Labels:');
    labels.forEach(label => console.log(label.description));
    */
}

async function main() {
    const filenames = readdirSync(basePath).map(f => basePath + f);



    for (let i = 0; i < filenames.length; i++) {
      const result = await getTextFromFiles([filenames[i]])[0];
      console.log(result);
    }

    //const filenames = getImageUrls();
    //await annotateImage(filenames[0]);
}

main()





