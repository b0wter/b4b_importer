import { readFileSync } from 'fs';
import { createRequire } from 'module'

const require = createRequire(import.meta.url);
const process = require('process');
const path = require('path');

const knownBadMatches = [ 
    'Ceeten aas', 
    'A', 
    'FIRST AID', 
    'SHOCK', 
    'DISGARD',
    'RESPIRATORY STIMULANT',
    'ALCOHOL 35%, AMMONIA 15',
    'FOR INHALATION ONLY',
    'CRUSH',
    '0.3 ml AMMONIA INHALANT',
    'A RESPIRATORY STIMULANT',
    'KEEP OUT OF REACH OF CHL',
    'HERE',
    '',
]

let counter = 0;
let isFirstCard = true;

function transform(item)
{
    const text = item.textAnnotations[0].description;
    const lines = text.split('\n');

    counter++;

    return {
        id: counter,
        title: lines[0],
        kind: lines[1],
        properties: lines.slice(2).filter(line => !knownBadMatches.includes(line)),
        file: path.basename(item.filename)
    }
}

function printAsElm(parsedItem)
{
    const s = isFirstCard ? '[' : ',';
    isFirstCard = false;
    console.log(`    ${s} { id = ${parsedItem.id}`);
    console.log(`      , title = "${parsedItem.title}"`);
    console.log(`      , kind = "${parsedItem.kind}"`);
    console.log(`      , filename = "${parsedItem.file}"`);

    if(parsedItem.properties.length > 0) {
    console.log(`      , properties =`)
    console.log(`            [ "${parsedItem.properties[0]}"`);
    }
    else {
    console.log(`      , properties = []`)
    }

    if(parsedItem.properties.length > 1) {
        for (const prop of parsedItem.properties.slice(1))
            console.log(`            , "${prop}"`)
    }

    if(parsedItem.properties.length > 0) {
    console.log(`            ]`)
    }
    console.log(`      , effects = []`)

    console.log(`      }   `)
}

async function main()
{
    const content = readFileSync(process.argv[2]);
    const cards = JSON.parse(content).map(transform);

    for(const c of cards)
        printAsElm(c);
    console.log(`    ]`);
}

main();