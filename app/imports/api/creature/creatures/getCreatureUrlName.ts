import getSlug from 'speakingurl';

export default function getCreatureUrlName({ name }: { name: string }) {
  return getSlug(name, { maintainCase: true }) || '-';
}
