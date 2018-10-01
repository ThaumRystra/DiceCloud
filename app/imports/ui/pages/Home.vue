<template>
  <toolbar-layout>
    <div slot="toolbar">
      DiceCloud
    </div>
    <div class="content">
      <section>
        <v-parallax src="/png/paper-dice-crown.png" height="300">
          <v-layout column align-center justify-center class="white--text">
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
        <v-layout row wrap justify-space-around class="selling-points">
          <v-layout column align-center>
            <v-icon x-large class="ma-2">
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
          <v-layout column align-center>
            <v-icon x-large class="ma-2">
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
          <v-layout column align-center>
            <v-icon x-large class="ma-2">
              scatter_plot
            </v-icon>
            <h3 class="mb-2">
              Inventory manager
            </h3>
            <p>
              Equiping items changes your characters stats automatically. Drag
              items to other characters, or between sheets open on different
              tabs.
            </p>
          </v-layout>
        </v-layout>
      </section>
      <section class="ma-5">
        <v-layout row align-center justify-space-around>
          <v-btn color="accent" round large>
            Sign up
          </v-btn>
        </v-layout>
      </section>
      <section>
        <h1 class="mb-2 text-xs-center">
          Check out the example characters
        </h1>
        <v-layout row align-center justify-space-around class="pa-4">
          <a href="/character/yBWwt5XQTTHZiRQxq">
            <v-hover>
                <v-card
                  slot-scope="{ hover }"
                  :class="`elevation-${hover ? 12 : 2}`"
                >
                  <v-card-text>
                    Starter set archer
                  </v-card-text>
                </v-card>
            </v-hover>
          </a>
          <a href="/character/yBWwt5XQTTHZiRQxq">
            <v-hover>
                <v-card
                  slot-scope="{ hover }"
                  :class="`elevation-${hover ? 12 : 2}`"
                >
                  <v-card-text>
                    Starter set wizard
                  </v-card-text>
                </v-card>
            </v-hover>
          </a>
        </v-layout>
      </section>
      <section class="text-xs-center grey darken-3 white--text pa-5">
        <h1>
          Get involved in the DiceCloud community
        </h1>
        <v-layout row wrap align-center justify-space-around class="pa-4">
          <v-btn href="https://reddit.com/r/dicecloud" flat large color="secondary">
            Reddit
          </v-btn>
          <v-flex>
            <v-btn href="https://discord.gg/qEvdfeB" flat large color="secondary">
              Discord
            </v-btn>
          </v-flex>
          <v-flex>
            <v-btn href="https://www.patreon.com/dicecloud" flat large color="secondary">
              Patreon
            </v-btn>
          </v-flex>
          <v-flex>
            <v-btn href="https://github.com/ThaumRystra/DiceCloud" flat large color="secondary">
              Github
            </v-btn>
          </v-flex>
        </v-layout>
      </section>
    </div>
  </toolbar-layout>
</template>

<script>
  import ToolbarLayout from "/imports/ui/layouts/ToolbarLayout.vue";
  export default {
    components: {
      ToolbarLayout,
    },
  };
</script>

<style scoped>
  .selling-points > * {
    max-width: 400px;
  }
</style>
