<template>
  <div
    class="home content layout column justify-space-between"
    style="min-height: 100%;"
  >
    <section
      class="py-12 px-4"
    >
      <v-row
        align="end"
        justify="center"
        class="mb-8"
      >
        <v-col
          class="text-center"
          cols="12"
        >
          <h1 class="text-h4 mb-4">
            {{ $t('home.title') }}
          </h1>
          <h4 class="subheading">
            {{ $t('home.subtitle') }}
          </h4>
        </v-col>
      </v-row>
      <v-layout
        v-if="!signedIn"
        align-center
        justify-center
      >
        <v-btn
          color="accent"
          rounded
          large
          to="/register"
          class="mr-4"
        >
          {{ $t('home.register') }}
        </v-btn>
        <v-btn
          color="accent"
          rounded
          outlined
          large
          to="/sign-in"
        >
          {{ $t('home.signIn') }}
        </v-btn>
      </v-layout>
      <v-layout
        v-else
        align-center
        justify-center
      >
        <v-btn
          color="accent"
          rounded
          large
          to="/character-list"
          class="mr-4"
        >
          {{ $t('home.myCharacters') }}
        </v-btn>
      </v-layout>
    </section>
    <section>
      <v-parallax
        src="/images/crown-dice-on-ipad.webp"
        height="300"
      />
    </section>
    <section class="text-center py-8 px-4">
      <v-layout
        wrap
        justify-space-around
        class="selling-points"
      >
        <v-layout
          column
          align-center
        >
          <v-icon
            x-large
            class="ma-2"
          >
            mdi-currency-usd-off
          </v-icon>
          <h3 class="mb-2">
            {{ $t('home.freeOpen') }}
          </h3>
          <p>
            {{ $t('home.freeOpenDescription') }}
          </p>
        </v-layout>
        <v-layout
          column
          align-center
        >
          <v-icon
            x-large
            class="ma-2"
          >
            mdi-ballot-outline
          </v-icon>
          <h3 class="mb-2">
            {{ $t('home.customEverything') }}
          </h3>
          <p>
            {{ $t('home.customEverythingDescription') }}
          </p>
        </v-layout>
        <v-layout
          column
          align-center
        >
          <v-icon
            x-large
            class="ma-2"
          >
            mdi-file-tree-outline
          </v-icon>
          <h3 class="mb-2">
            {{ $t('home.advancedCharacters') }}
          </h3>
          <p>
            {{ $t('home.advancedCharactersDescription') }}
          </p>
        </v-layout>
      </v-layout>
    </section>
    <section class="pa-8">
      <v-row>
        <v-col
          v-for="(card, index) in highlightCards"
          :key="index"
          v-bind="cols"
        >
          <v-card
            tile
            :elevation="0"
          >
            <v-img
              class="white--text align-end"
              :src="'/images/screenshots/' + card.img"
              gradient="to bottom, rgba(0,0,0,0), rgba(0,0,0,.5)"
              height="360px"
            >
              <v-card-title v-text="card.text" />  
            </v-img>
          </v-card>
        </v-col>
      </v-row>
    </section>
    <section class="text-center grey darken-3 white--text pa-5">
      <h1>
        {{ $t('home.getInvolved') }}
      </h1>
      <v-layout
        wrap
        align-center
        justify-space-around
        class="pa-4"
      >
        <v-btn
          v-for="btn in [
            {link: 'https://discord.gg/qEvdfeB', name: 'Discord'},
            {link: 'https://www.patreon.com/dicecloud', name: 'Patreon'},
            {link: 'https://github.com/ThaumRystra/DiceCloud', name: 'Github'},
          ]"
          :key="btn.name"
          :href="btn.link"
          outlined
          large
          dark
        >
          {{ btn.name }}
          <v-icon
            right
          >
            mdi-open-in-new
          </v-icon>
        </v-btn>
      </v-layout>
    </section>
  </div>
</template>

<script lang="js">
export default {
  data() {return {
    cols: {
      cols: 12,
      sm: 6,
      md: 4,
      lg: 3,
      xl: 2,
    },
    // TODO: The translation doesn't work here
    highlightCards: [
      { text: this.$t('home.highlightCards.automatedActions'), img: 'actions.webp' },
      { text: this.$t('home.highlightCards.auditableStats'), img: 'auditable.webp' },
      { text: this.$t('home.highlightCards.diceRolling'), img: 'automated-dice-rolls.webp' },
      { text: this.$t('home.highlightCards.hackableChar'), img: 'build-system.webp' },
      { text: this.$t('home.highlightCards.dragAndDrop'), img: 'inventory.webp' },
      { text: this.$t('home.highlightCards.customLibraries'), img: 'libraries-of-content.webp' },
      { text: this.$t('home.highlightCards.discordWebhooks'), img: 'send-to-discord.webp' },
      { text: this.$t('home.highlightCards.printedCharacters'), img: 'printing.webp' },
    ],
  }},
  meteor: {
    signedIn() {
      return Meteor.userId();
    },
  }
};
</script>

<style scoped>
.selling-points>* {
  max-width: 400px;
}
.dark-gradient {
  background: linear-gradient(0deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%);
}
</style>
