<template>
  <div
    class="content layout column justify-space-between"
    style="min-height: 100%;"
  >
    <section>
      <v-parallax
        src="/images/paper-dice-crown.png"
        height="300"
      >
        <v-layout
          column
          align-center
          justify-center
          class="white--text"
        >
          <h1 class="white--text mb-2 text-h4 text-center">
            DiceCloud - Free, Auditable, real-time character tracking for 5th edition
          </h1>
          <div class="subheading mb-3 text-center">
            Spend less time shuffling paper, and more time playing the game
          </div>
        </v-layout>
      </v-parallax>
    </section>
    <section class="text-center">
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
            DiceCloud is free to use. Its hosting is funded via Patreon,
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
            Character sheets optimised for one ruleset
          </h3>
          <p>
            By having a narrrow scope, DiceCloud can be the best at what it
            does: being a fully automated character tracker
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
            Inventory manager
          </h3>
          <p>
            Equiping items changes your characters stats automatically.
          </p>
        </v-layout>
      </v-layout>
    </section>
    <section
      v-if="!signedIn"
      class="ma-5"
    >
      <v-layout
        align-center
        justify-space-around
      >
        <v-btn
          color="accent"
          rounded
          large
          to="/sign-in"
        >
          Sign In
        </v-btn>
      </v-layout>
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
          text
          large
          color="primary"
        >
          {{ btn.name }}
        </v-btn>
      </v-layout>
    </section>
  </div>
</template>

<script lang="js">
  export default {
    meteor: {
      signedIn(){
				return Meteor.userId();
			},
    }
  };
</script>

<style scoped>
  .selling-points > * {
    max-width: 400px;
  }
</style>
