import type { CreatureProperty } from '/imports/api/creature/creatureProperties/CreatureProperties';
import type { Creature } from '/imports/api/creature/creatures/Creatures';
import type { Library } from '/imports/api/library/Libraries';
import type { LibraryNode } from '/imports/api/library/LibraryNodes';

export type ReferenceCollection = 'creatures' | 'libraries' | 'libraryNodes' | 'creatureProperties' | 'docs';
export const referenceCollections: ReferenceCollection[] = ['creatures', 'libraries', 'libraryNodes', 'creatureProperties', 'docs'];

export type Reference = {
  id: string,
  collection: ReferenceCollection;
}

export async function getDocByRefAsync(ref: { id: string, collection: 'creatures' }): Promise<Creature | undefined>
export async function getDocByRefAsync(ref: { id: string, collection: 'creatureProperties' }): Promise<CreatureProperty | undefined>
export async function getDocByRefAsync(ref: { id: string, collection: 'libraries' }): Promise<Library | undefined>
export async function getDocByRefAsync(ref: { id: string, collection: 'libraryNodes' }): Promise<LibraryNode | undefined>
export async function getDocByRefAsync(ref: { id: string, collection: 'docs' }): Promise<never>
export async function getDocByRefAsync(ref: { id: string, collection: 'creatures' | 'libraries' }): Promise<Creature | Library | undefined>
export async function getDocByRefAsync(ref: Reference): Promise<Creature | CreatureProperty | Library | LibraryNode | undefined>
export async function getDocByRefAsync(ref: Reference): Promise<Creature | CreatureProperty | Library | LibraryNode | undefined> {
  const collection = Mongo.Collection.get(ref.collection);
  return collection.findOneAsync(ref.id) as any;
}
