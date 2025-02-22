<template>
  <div class="sidebar">
    <v-layout v-if="!signedIn" justify-center>
      <v-btn text to="/sign-in">
        {{ $t('Sidebar.Ic_fWFzKEAoFGAzBaHGE0') }}
      </v-btn>
    </v-layout>

    <v-list nav class="links">
      <v-list-item v-if="signedIn">
        <v-list-item-content>
          <v-list-item-title>
            {{ userName }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-tooltip bottom>
            <template #activator="{ on }">
              <v-btn icon to="/account" v-on="on">
                <v-icon>mdi-cog</v-icon>
              </v-btn>
            </template>
            <span>{{ $t('Sidebar.TLlr6aU-7D83jdG1gJHY8') }}</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>

      <v-list-item v-for="(link, i) in links" :key="i" :to="link.to" :href="link.href" :target="link.href ? '_blank' : undefined">
        <v-list-item-action>
          <v-icon>{{ link.icon }}</v-icon>
        </v-list-item-action>
        <v-list-item-title>
          {{ link.title }}
        </v-list-item-title>
        <v-icon v-if="link.href">
          mdi-open-in-new
        </v-icon>
      </v-list-item>

      <v-divider />

      <!-- 🔹 Seletor de Idiomas -->
      <v-list-item>
        <v-list-item-content>
          <v-select
            v-model="selectedLocale"
            :items="availableLocales"
            @change="changeLocale"
            dense
            outlined
            hide-details
            class="language-selector"
          >
            <template #selection="{ item }">
              <span>{{ item.flag }} {{ item.text }}</span>
            </template>
            <template #item="{ item }">
              <span>{{ item.flag }} {{ item.text }}</span>
            </template>
          </v-select>
        </v-list-item-content>
      </v-list-item>
    </v-list>

    <creature-folder-list v-if="signedIn" dense :creatures="CreaturesWithNoParty" :folders="folders" />
  </div>
</template>

<script lang="js">
import Creatures from '/imports/api/creature/creatures/Creatures';
import CreatureFolders from '/imports/api/creature/creatureFolders/CreatureFolders';
import CreatureFolderList from '/imports/client/ui/creature/creatureList/CreatureFolderList.vue';
import getCreatureUrlName from '/imports/api/creature/creatures/getCreatureUrlName';
import { uniq, flatten } from 'lodash';

const characterTransform = function (char) {
  char.url = `/character/${char._id}/${getCreatureUrlName(char)}`;
  char.initial = char.name && char.name[0] || this.$t('CharacterList.5Lh6_XvKqv3A7OD7dR00y');
  return char;
};

export default {
  components: {
    CreatureFolderList
  },
  data() {
    return {
      selectedLocale: this.$i18n.locale, // Setup initial locale
    };
  },
  computed: {
    availableLocales() {
      const flags = {
        en: '🇬🇧',
        pt: '🇧🇷',
        es: '🇪🇸',
        fr: '🇫🇷',
        de: '🇩🇪',
      };
      return this.$i18n.availableLocales.map(locale => ({
        text: locale.toUpperCase(),
        value: locale,
        flag: flags[locale] || '🏳️', // Use the corresponding flag or a generic one
      }));
    },
    signedIn() {
      return !!Meteor.userId();
    },
    userName() {
      let user = Meteor.user();
      return user && user.username || user && user._id;
    },
    links() {
      let isLoggedIn = !!Meteor.userId();
      let links = [
        { title: this.$t('Maintenance.xn1iabUyQAcN50064OLqt'), icon: 'mdi-home', to: '/' },
        { title: this.$t('Sidebar.Rr1M41-BLJbeBDuSMqsqs'), icon: 'mdi-account-group', to: '/character-list', requireLogin: true },
        { title: this.$t('SingleLibrary.8o8zfT4rnslD95pstr578'), icon: 'mdi-library-shelves', to: '/library', requireLogin: true },
        { title: this.$t('Sidebar.lO8RxJFgOO2O9Sl2b1pxT'), icon: 'mdi-table-furniture', to: '/tabletops', requireLogin: true },
        { title: this.$t('Sidebar.BPQym8QzWFodXZjtBNfdd'), icon: 'mdi-file-multiple', to: '/my-files', requireLogin: true },
        { title: this.$t('DocsPage.owEFuhKAi0S5XmhIaiqMB'), icon: 'mdi-book-open-variant', to: '/docs' },
        { title: this.$t('Sidebar.pxf1SzERzQzKgl3Anfi1F'), icon: 'mdi-bug', to: '/feedback' },
        { title: this.$t('Sidebar.pIDDy8BnVkf01Ysma7Gaj'), icon: 'mdi-sign-text', to: '/about' },
        { title: this.$t('Account.U9BIXDXwbO63Izqnr9n7o'), icon: 'mdi-patreon', href: 'https://www.patreon.com/dicecloud' },
        { title: this.$t('Sidebar.ji7gEHWu4QoZQOsY9ZMJW'), icon: 'mdi-github', href: 'https://github.com/ThaumRystra/DiceCloud/' },
      ];
      return links.filter(link => !link.requireLogin || isLoggedIn);
    },
    folders() {
      const userId = Meteor.userId();
      let folders = CreatureFolders.find(
        { owner: userId, archived: { $ne: true } },
        { sort: { name: 1 } },
      ).map(folder => {
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
      folders = folders.filter(folder => !!folder.creatures.length);
      return folders;
    },
    CreaturesWithNoParty() {
      var userId = Meteor.userId();
      var charArrays = CreatureFolders.find({ owner: userId }).map(p => p.creatures);
      var folderChars = uniq(flatten(charArrays));
      return Creatures.find(
        {
          _id: { $nin: folderChars },
          $or: [{ readers: userId }, { writers: userId }, { owner: userId }],
          type: 'pc',
        },
        { sort: { name: 1 } }
      ).map(characterTransform);
    },
  },
  methods: {
    changeLocale(locale) {
      this.$i18n.locale = locale;
      this.selectedLocale = locale;
      localStorage.setItem('userLocale', locale); // Saves the selected locale in the local storage
    },
  },
};
</script>

<style scoped>
.language-selector {
  max-width: 150px;
}
.links .v-list-item:not(:last-child):not(:only-child) {
  margin-bottom: 4px;
}
</style>
