import { writeIcons } from '/imports/api/icons/Icons.js';

/*
 * Import a SVG sprite file. All the icons must contain one id and one path with a
 * single 'd' attribute.
 *
 * A svg sprite file can be created by downloading the entire archive of
 * https://game-icons.net/ then using the search function with *.svg to copy
 * all the individual files into a single directory, and then using the npm
 * sprite-generator to run `svg-sprite-generate -d icons -o sprite.svg` to save
 * the sprite file.
*/

export default function importIcons(file){
  let id, d, icons = [];
  let reader = new FileReader();

  reader.onload = function(){
    reader.result.match(/i?d="([^"])+"/gi).forEach(s => {
      if (s[0] === 'i'){
        id = s.slice(4, -1);
      } else if (s[0] === 'd'){
        d = s.slice(3, -1);
        icons.push ({_id: Random.id(), name: id, shape: d});
      }
    });
    writeIcons.call(icons);
  };

  reader.readAsText(file);
};
