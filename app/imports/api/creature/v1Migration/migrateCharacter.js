import { fetch } from 'meteor/fetch'

export default function importCharacter(url){
  // Using v1's JSON API to fetch the character data in a nice format
  // url -> https://dicecloud.com/character/HxerC2ZYXKrNc8u2M/json?key=<key>
  fetch(url)
    .then(response => response.json())
    .then(data => {
      let character = data.characters[0];
      console.log(character.name  + ' fetched successfuly')
    });
}
