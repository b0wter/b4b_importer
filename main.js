import { readFileSync } from 'fs';
import { createRequire } from 'module'

const require = createRequire(import.meta.url);
const vision = require('@google-cloud/vision')
const client = new vision.ImageAnnotatorClient();
const process = require('process')

async function main() {
    const filename = process.argv[2];

    const fileContent = readFileSync(filename);
    const request = {
        image: {
            content: fileContent.toString('base64'),
        },
        features: [{ type: 'TEXT_DETECTION' }],
    };

    const response = await client.annotateImage(request).then(x => x[0]);

    const result = {
        textAnnotations: response.textAnnotations,
        filename: filename
    }
    console.log(JSON.stringify(result), ',');
}

main();