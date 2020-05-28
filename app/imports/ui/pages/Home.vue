<template>
  <div>
    <div class="content">
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
            <h1 class="white--text mb-2 display-1 text-xs-center">
              DiceCloud - Free, Auditable, real-time character tracking for 5th edition
            </h1>
            <div class="subheading mb-3 text-xs-center">
              Spend less time shuffling paper, and more time playing the game
            </div>
          </v-layout>
        </v-parallax>
      </section>
      <section class="text-xs-center">
        <v-layout
          row
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
              money_off
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
              ballot
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
              scatter_plot
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
          row
          align-center
          justify-space-around
        >
          <v-btn
            color="accent"
            round
            large
            to="/sign-in"
          >
            Sign In
          </v-btn>
        </v-layout>
      </section>
      <section class="text-xs-center grey darken-3 white--text pa-5">
        <h1>
          Get involved in the DiceCloud community
        </h1>
        <v-layout
          row
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
            flat
            large
            color="primary"
          >
            {{ btn.name }}
          </v-btn>
        </v-layout>
      </section>
    </div>
  </div>
</template>

<script>
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
