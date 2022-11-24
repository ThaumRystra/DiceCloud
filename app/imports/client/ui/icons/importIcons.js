import { writeIcons } from '/imports/api/icons/Icons.js';

/*
 * Import a SVG sprite file.
 *
 * A svg sprite file can be created by downloading the entire archive of
 * https://game-icons.net/ then using the search function with *.svg to copy
 * all the individual files into a single directory, and then using
 * `npm i -g svg-sprite-generator` `npm i -g xml-js`
 * run `svg-sprite-generate -d icons -o sprite.xml`
 * run `xml-js sprite.xml --out sprite.json --compact true `
 * to save the sprite file as json.
*/
let metadata;

export function importIcons(file){
  let reader = new FileReader();
  if (! metadata) throw 'No metadata to build with';

  reader.onload = function(){
    let data = JSON.parse(reader.result);
    let icons = [];
    data.svg.symbol.forEach(iconData => {
      let name = iconData._attributes.id;
      let shape = iconData.path[1]._attributes.d;
      let icon = metadata[name] || {};
      icon._id = Random.id();
      icon.name = name;
      icon.shape = shape;
      icons.push(icon);
    });
    writeIcons.call(icons);
  };

  reader.readAsText(file);
}

// Get metadata here:
// https://gist.github.com/ThaumRystra/ffb264dea8c32e15de95f775596194a4
// It is probably out of date though
export function importIconMetadata(file){
  let reader = new FileReader();

  reader.onload = function(){
    metadata = JSON.parse(reader.result);
    console.log(metadata);
  };

  reader.readAsText(file);
}
