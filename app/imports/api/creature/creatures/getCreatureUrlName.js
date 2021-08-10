import getSlug from 'speakingurl';

export default function getCreatureUrlName({name}){
  return getSlug(name, {maintainCase: true}) || '-';
}
