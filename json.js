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
    'Fin',
    'Atteghe',
    '73',
    '730',
    'CK',
    '00:05',
    '09',
    'HUN',
    'SATCUSIVE',
    'MINERS',
    'FRLE',
    '13',
    'RANCEN',
    'AID',
    'RANK',
    'Allegheny',
    'NATIONAL FOREST',
    'ENE',
    'SHOCH',
    'Funt',
    'CIN',
    'NET Y OZ 0',
    'EN RG',
    'Ki',
    '4 CLU',
    'CARTK',
    'Belea',
    'Bogla',
    '7.42MM X 5IMM',
    '-',
    '',
]

const knownReplacements = [
    {
        replace: "OFFÉNSE",
        with: "OFFENSE"
    }
]

let counter = 0;
let isFirstCard = true;

function applyKnownReplacements(line)
{
    for(const replacement of knownReplacements)
    {
        line = line.replace(replacement.replace, replacement.with);
    }
    return line;
}

function mergePropertiesIfApplicable(title, properties)
{
    const cardsToMerge = [
        { title: "TACTICAL VEST", merge: [1, 2]},
        { title: "SPIKY BITS", merge: [1, 2]},
        { title: "MEAN DRUNK", merge: [1, 3]},
        { title: "МЕТН НЕAD", merge: [2, 3]},
        { title: "IGNORE THE PAIN", mergeTwo: [[0, 1], [1, 3]]}, // listed twice because it needs to merges
        { title: "PYRO", mergeTwo: [[ 1, 2 ], [ 2, 3 ]]},
        { title: "TWO IS ONE AND ONE IS NONE", merge: [ 0, 1 ]},
        { title: "OFFENSIVE SCAVENGER", mergeTwo: [[ 0, 1 ], [ 1, 2 ]]},
        { title: "ADMIN RELOAD", merge: [ 0, 1 ]},
        { title: "AMMO STASH", mergeTwo: [[ 0, 1 ], [ 1, 2 ]]},
        { title: "LIFE INSURANCE", merge: [ 1, 2 ]},
        { title: "СОСKY", merge: [ 1, 3 ]},
        { title: "RUN LIKE HELL", merge: [ 1, 3 ]},
        { title: "RECKLESS", merge: [ 1, 2 ]},
        { title: "СOMBAT MEDIC", merge: [ 1 , 2 ]},
        { title: "MEDICAL EXPERT", merge: [ 1, 2, 3 ]},
        { title: "ROLLING THUNDER", merge: [ 0, 1 ]},
        { title: "SPEED DEMON", mergeTwo: [[ 0, 1 ], [ 1, 2 ]]},
        { title: "MARATHON RUNNER", merge: [ 0, 1 ]},
        { title: "ADRENALINE FUELED", merge: [ 2, 4 ]},
        { title: "HEADBAND MAGNIFIER", merge: [ 1, 3 ]},
        { title: "UTILITY SCAVENGER", merge: [ 1, 2 ]},
        { title: "SUPPORT SCAVENGER", merge: [ 0, 1 ]},
        { title: "MAG CARRIER", merge: [ 1, 2 ]},
        { title: "SILVER BULLETS", merge: [ 2, 3 ]},
        { title: "NEEDS OF THE MANY", merge: [ 1, 2 ]},
        { title: "DOWN IN FRONT!", merge: [ 0, 1 ]},
        { title: "WELL FED", merge: [ 1, 2 ]},
        { title: "SURPLUS POUCHES", merge: [ 1, 2 ]},
        { title: "ВОХ ' ВAGS", merge: [ 1, 2 ]},
        { title: "ROUSING SPEECH", merge: [ 2, 3 ]},
        { title: "KNOWLEDGE IS POWER", merge: [ 1, 3 ]},
        "PATIENT HUNTER",
        "AMPED UP",
        "POWER RELOAD",
        "MARKED FOR DEATH",
        "EXPERIENCED EMT",
        "CONFIDENT KILLER",
        "HEAVY HITTER",
        "BERSERKER",
        "TRUE GRIT",
        "SCAR TISSUE",
        "LINE 'EM UP",
        "FACE YOUR FEARS",
        "HEAVY ATTACK",
        "SUNDER",
        "OVERWATCH",
        "FRESH BANDAGE",
        "CHEMICAL COURAGE",
        "NUMB",
        "BROADSIDE",
        "BUCKSHOT BRUISER",
        "MUGGER",
        "HIGHWAYMAN",
        "BOUNTY HUNTER",
        "WOUNDED ANIMAL",
        "COMPOUND INTEREST",
        "LUCKY PENNIES",
        "MONEY GRUBBERS",
        "SHARE THE WEALTH",
        "SAFEROOM RECOVERY",
        "RECKLESS",
        "FIRE IN THE HOLE!",
        "MANDATORY PT",
        "SHREDDER",
        "SADISTIC",
        "EVASIVE ACTION",
        "MIRACULOUS RECOVERY",
        "ON YOUR MARK..",
        "POWER SWAP",
        "INSPIRING SACRIFICE",
        "CHARITABLE SOUL",
        "HUNKER DOWN",
        "AVENGE THE FALLEN",
        "VANGUARD",
        "IN THE ZONE",
        "TRIGGER CONTROL",
        "COMBAT KNIFE",
        "MEATGRINDER",
        "SCATTERGUN SKILLS",
        "CONTROLLED MOVEMENT",
        "AMMO FOR ALL",
        "POULTICE",
        "GROUP THERAPY",
        "MEDICAL PROFESSIONAL",
        "AMMO SCAVENGER"
    ]

    function mergeInterval(props, from, to)
    {
        const prefix = props.slice(0, from);
        const toMerge = props.slice(from, to + 1);
        const suffix = props.slice(to + 1);

        const merged = toMerge.join(' ');

        prefix.push(merged)
        return prefix.concat(suffix);
    }

    for(const merge of cardsToMerge)
    {
        if(merge === title)
        {
            const joined =  properties.join(' ');
            return [ joined ];
        }
        else if(merge.title && merge.title === title && merge.merge)
        {
           return mergeInterval(properties, merge.merge[0], merge.merge[1]);
        }
        else if(merge.title && merge.title === title && merge.mergeTwo)
        {
            const afterFirstMerge = mergeInterval(properties, merge.mergeTwo[0][0], merge.mergeTwo[0][1]);
            return mergeInterval(afterFirstMerge, merge.mergeTwo[1][0], merge.mergeTwo[1][1]);
        }
    }
    return properties;
}

function fixMissingDashesForPercentValues(title, properties)
{
    const ignoredCards = [ 
        "CHARITABLE SOUL",
        "AVENGE THE FALLEN",
        "SUNDER"
    ]

    if (ignoredCards.includes(title))
        return properties;

    function addDash(match)
    {
        return "- " + match;
    }

    properties = properties.map(line => line.replace(/^\d+\%/msg, addDash));
    return properties;
}

function transform(item)
{
    const text = item.textAnnotations[0].description;
    const lines = text.split('\n');

    lines.map(applyKnownReplacements);

    counter++;

    let properties = 
        lines
        .slice(2)
        .filter(line => !knownBadMatches.includes(line));

    const title = lines[0];
    properties = fixMissingDashesForPercentValues(title, properties);
    properties = mergePropertiesIfApplicable(title, properties);

    return {
        id: counter,
        title: title,
        kind: lines[1],
        properties: properties,
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

    if(!parsedItem.properties)
        console.log("missing properties:", parsedItem);

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