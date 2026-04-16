import type { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import CreatureProperties from '/imports/api/creature/creatureProperties/CreatureProperties';
import type { Creature } from '/imports/api/creature/creatures/Creatures';
import { getCreature } from '/imports/api/engine/loadCreatures';
import type { Library } from '/imports/api/library/Libraries';
import Libraries from '/imports/api/library/Libraries';
import type { LibraryNode } from '/imports/api/library/LibraryNodes';
import LibraryNodes from '/imports/api/library/LibraryNodes';

export type ReferenceCollection = 'creatures' | 'libraries' | 'libraryNodes' | 'creatureProperties' | 'docs';

export type Reference = {
  id: string,
  collection: ReferenceCollection;
}

export async function getDocByRefAsync(ref: { id: string, collection: 'creatures' }): Promise<Creature | undefined>
export async function getDocByRefAsync(ref: { id: string, collection: 'creatureProperties' }): Promise<CreatureProperty | undefined>
export async function getDocByRefAsync(ref: { id: string, collection: 'libraries' }): Promise<Library | undefined>
export async function getDocByRefAsync(ref: { id: string, collection: 'libraryNodes' }): Promise<LibraryNode | undefined>
export async function getDocByRefAsync(ref: { id: string, collection: 'docs' }): Promise<never>
export async function getDocByRefAsync(ref: Reference): Promise<Creature | CreatureProperty | Library | LibraryNode | undefined>
export async function getDocByRefAsync(ref: Reference): Promise<Creature | CreatureProperty | Library | LibraryNode | undefined> {
  switch (ref.collection) {
    case 'creatures': return getCreature(ref.id);
    case 'creatureProperties': return CreatureProperties.findOneAsync(ref.id);
    case 'libraries': return Libraries.findOneAsync(ref.id);
    case 'libraryNodes': return LibraryNodes.findOneAsync(ref.id);
    case 'docs': throw new Meteor.Error('invalid-reference-collection', `Can't resolve references to ${ref.collection}`);
  }
}


