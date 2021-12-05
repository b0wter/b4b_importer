import { readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module'
import { parse } from 'csv-parse/sync';

const require = createRequire(import.meta.url);
const process = require('process');
const path = require('path');

var cardsWithImages = JSON.parse(readFileSync('../b4b/assets/all_cards_from_ai.json'));
const cardsFromCsv = parse(readFileSync('../b4b/assets/all_cards.tsv'), { columns: true, delimiter: '\t'});

const upperSupplyLine = parse(readFileSync('../b4b/assets/upper_supply_line.csv'), { columns: true, delimiter: ','}).map(x => { x.category = "Top"; return x; });
const middleSupplyLine = parse(readFileSync('../b4b/assets/middle_supply_line.csv'), { columns: true, delimiter: ','}).map(x => { x.category = "Middle"; return x; });
const bottomSupplyLine = parse(readFileSync('../b4b/assets/bottom_supply_line.csv'), { columns: true, delimiter: ','}).map(x => { x.category = "Bottom"; return x; });
const achievementSupplyLine = parse(readFileSync('../b4b/assets/achievement_supply_line.csv'), { columns: true, delimiter: ','}).map(x => { x.category = "Achievement"; return x; });
const stripSupplyLine = parse(readFileSync('../b4b/assets/strip_supply_line.csv'), { columns: true, delimiter: ','}).map(x => { x.category = "The Strip"; return x; });
const starterSupplyLine = parse(readFileSync('../b4b/assets/starter_supply_line.csv'), { columns: true, delimiter: ','}).map(x => { x.category = "Starter Set"; return x; });
const typeAndAffinity = parse(readFileSync('../b4b/assets/type_and_affinity.csv'), { columns: true, delimiter: ','});

const supplyLines = upperSupplyLine.concat(middleSupplyLine.concat(bottomSupplyLine.concat(achievementSupplyLine.concat(stripSupplyLine.concat(starterSupplyLine))))).map(l => { l.cardName.trimEnd(); return l; });

let counter = 1;
const updatedCards = cardsFromCsv.map(c => {
    const matchingCardWithImage = cardsWithImages.find(card => {
        if(!card.title)
            console.log("title not set", card);
        if(!c.name)
            console.log("name not set", c);
        
        return (card.title.toLowerCase() === c.name.toLowerCase())
    });
    if(!matchingCardWithImage)
    {
        throw new Error(`Could not find matching card for ${c}`);
    }
    else
    {
        console.log('Found match for ', c.name);

        const line = supplyLines.find(s => s.cardName.toLowerCase() === c.name.toLowerCase());
        if(!line)
            throw new Error(`Could not find supply line for ${c.name}`);
        console.log(line.name, line.version);
        cardsWithImages = cardsWithImages.filter(c => c.id !== matchingCardWithImage.id);
        c.filename = matchingCardWithImage.filename;
        delete(c.type);
        c.properties = matchingCardWithImage.properties.map(p => {
            function replacer(match)
            {
                const result = match.replace(' ', '');
                return result;
            }
            //p.description = p.description.replace(/[\+,\-]\s\d+\%/, replacer);
            p.description = p.description.replace(/[\+,\-]\s\d+/, replacer);
            return p.description;
        });
        c.supplyLine = { track: c.deck, name: line.name, tier: line.version, index: c.index };
        delete(c.deck);
        delete(c.index);

        const ta = typeAndAffinity.find(x => x.name.toLowerCase() === c.name.toLowerCase())
        if(!ta)
            throw new Error(`Could not finde type and affinity for ${c}`);
        c.kind = ta.type.trimEnd().trimStart();
        c.affinity = ta.affinity.trimEnd().trimStart();
        c.id = counter;
        counter++;
        return c;
    }
});

if(cardsWithImages.length > 0)
{
    console.log(`There are ${cardsWithImages.length} unmatched cards:`);
    for(const c of cardsWithImages)
    {
        console.log(c);
    }
}

const json = JSON.stringify(updatedCards);
writeFileSync('merged_cards.json', json);