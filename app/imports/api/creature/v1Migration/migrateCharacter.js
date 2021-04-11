import { fetch } from 'meteor/fetch'

export default function importCharacter(url){
  // Using v1's JSON API to fetch the character data in a usable format
  // url -> https://dicecloud.com/character/<id>/json?key=<key>
  fetch(url)
    .then(response => response.json())
    .then(data => {
      let character = data.characters[0];
      console.log(character.name  + ' fetched successfuly')
    });
}
