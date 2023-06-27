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
            Free, Auditable, real-time character tracking for 5th edition
          </h1>
          <h4 class="subheading">
            Spend less time shuffling paper, and more time playing the game
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
          Register
        </v-btn>
        <v-btn
          color="accent"
          rounded
          outlined
          large
          to="/sign-in"
        >
          Sign In
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
          My Characters
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
            Free, open source, community funded
          </h3>
          <p>
            DiceCloud is free to use, funded via Patreon,
            and the source code is available on Github under a GPL license.
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
            Custom everything
          </h3>
          <p>
            Add new ability scores, skills, health-bars, and stats to your character.
            The entire sheet is under your control.
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
            Advanced Character Engine
          </h3>
          <p>
            Characters are computed in real-time based on their equipment,
            features, and buffs.
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
        Get involved in the DiceCloud community
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
    highlightCards: [
      { text: 'Automated actions', img: 'actions.webp' },
      { text: 'Auditable stats', img: 'auditable.webp' },
      { text: 'Dice rolling', img: 'automated-dice-rolls.webp' },
      { text: 'Hackable character builder', img: 'build-system.webp' },
      { text: 'Drag and drop inventory manager', img: 'inventory.webp' },
      { text: 'Custom libraries of content', img: 'libraries-of-content.webp' },
      { text: 'Discord webhooks', img: 'send-to-discord.webp' },
      { text: 'Printed character sheets', img: 'printing.webp' },
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
