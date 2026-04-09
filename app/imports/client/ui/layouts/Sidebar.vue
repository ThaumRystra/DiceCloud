<template>
  <div class="sidebar">
    <div
      v-if="!signedIn"
      class="d-flex justify-center"
    >
      <v-btn
        variant="text"
        to="/sign-in"
      >
        Sign in
      </v-btn>
    </div>
    <v-list
      nav
      class="links"
    >
      <v-list-item v-if="signedIn">
        <v-list-item-title>
          {{ userName }}
        </v-list-item-title>
        <template #append>
          <v-tooltip location="bottom">
            <template #activator="{ props }">
              <v-btn
                icon="mdi-cog"
                to="/account"
                v-bind="props"
              />
            </template>
            <span>Account Settings</span>
          </v-tooltip>
        </template>
      </v-list-item>

      <v-list-item
        v-for="(link, i) in links"
        :key="i"
        :to="link.to"
        :href="link.href"
        :target="link.href ? '_blank': undefined"
      >
        <template #prepend>
          <v-icon>{{ link.icon }}</v-icon>
        </template>
        <v-list-item-title>
          {{ link.title }}
        </v-list-item-title>
        <template v-if="link.href" #append>
          <v-icon>mdi-open-in-new</v-icon>
        </template>
      </v-list-item>
      <v-divider />
    </v-list>
    <creature-folder-list
      v-if="signedIn"
      density="compact"
      :creatures="CreaturesWithNoParty"
      :folders="folders"
    />
  </div>
</template>

<script setup lang="ts">
import { autorun, subscribe } from 'vue-meteor-tracker';
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureFolders from '/imports/api/creature/creatureFolders/CreatureFolders';
import CreatureFolderList from '/imports/client/ui/creature/creatureList/CreatureFolderList.vue';
import getCreatureUrlName from '/imports/api/creature/creatures/getCreatureUrlName';
import { uniq, flatten } from 'lodash';

const characterTransform = (char: any) => {
  char.url = `/character/${char._id}/${getCreatureUrlName(char)}`;
  char.initial = char.name && char.name[0] || '?';
  return char;
};

subscribe('characterList');

const { result: signedIn } = autorun(() => !!Meteor.userId());

const { result: userName } = autorun(() => {
  const user = Meteor.user() as any;
  return user?.username || user?._id;
});

const { result: links } = autorun(() => {
  const isLoggedIn = !!Meteor.userId();
  const allLinks = [
    { title: 'Home', icon: 'mdi-home', to: '/' },
    { title: 'Characters', icon: 'mdi-account-group', to: '/character-list', requireLogin: true },
    { title: 'Library', icon: 'mdi-library-shelves', to: '/library', requireLogin: true },
    { title: 'Tabletops', icon: 'mdi-table-furniture', to: '/tabletops', requireLogin: true },
    { title: 'Files', icon: 'mdi-file-multiple', to: '/my-files', requireLogin: true },
    { title: 'Documentation', icon: 'mdi-book-open-variant', to: '/docs' },
    { title: 'Feedback', icon: 'mdi-bug', to: '/feedback' },
    { title: 'About', icon: 'mdi-sign-text', to: '/about' },
    { title: 'Patreon', icon: 'mdi-patreon', href: 'https://www.patreon.com/dicecloud' },
    { title: 'Github', icon: 'mdi-github', href: 'https://github.com/ThaumRystra/DiceCloud/' },
  ];
  return allLinks.filter((link: any) => !link.requireLogin || isLoggedIn);
});

const { result: folders } = autorun(() => {
  const userId = Meteor.userId();
  let result = CreatureFolders.find(
    { owner: userId, archived: { $ne: true } },
    { sort: { name: 1 } },
  ).map((folder: any) => {
    folder.creatures = Creatures.find(
      {
        _id: { $in: folder.creatures || [] },
        $or: [{ readers: userId }, { writers: userId }, { owner: userId }],
      }, {
        sort: { name: 1 },
      }
    ).map(characterTransform);
    return folder;
  });
  return result.filter((folder: any) => !!folder.creatures.length);
});

const { result: CreaturesWithNoParty } = autorun(() => {
  const userId = Meteor.userId();
  const charArrays = CreatureFolders.find({ owner: userId }).map((p: any) => p.creatures);
  const folderChars = uniq(flatten(charArrays));
  return Creatures.find(
    {
      _id: { $nin: folderChars },
      $or: [{ readers: userId }, { writers: userId }, { owner: userId }],
      type: 'pc',
    },
    { sort: { name: 1 } }
  ).map(characterTransform);
});
</script>

<style scoped>
.links .v-list-item:not(:last-child):not(:only-child) {
  margin-bottom: 4px;
}
</style>
