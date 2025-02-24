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
            {{ $t('Home.XeHB-ri_R1Fs3krM9WW1T') }}
          </h1>
          <h4 class="subheading">
            {{ $t('Home.uodl_ID-ITNFfUK4ean3D') }}
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
          {{ $t('Home.Y7uTRbv5hbEkIplOp6-XF') }}
        </v-btn>
        <v-btn
          color="accent"
          rounded
          outlined
          large
          to="/sign-in"
        >
          {{ $t('Home.Q8kGqjMJQ66X0YCH3JT0g') }}
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
          {{ $t('Home.9XmQezuJY9CHkr2yXlG5y') }}
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
            {{ $t('Home.XbWzTaqP9chSvLj_RPime') }}
          </h3>
          <p>
            {{ $t('Home.AakehfukJAU2EA4nhtjaa') }}
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
            {{ $t('Home._6k6pNSuKlvfKOQ-0UUsF') }}
          </h3>
          <p>
            {{ $t('Home.fdNeOF7AbJX2Jvv2mcFNH') }}
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
            {{ $t('Home.9CRckySuULPz5MD9axBve') }}
          </h3>
          <p>
            {{ $t('Home.sZrF8-Jl7NrcNJFS76ngY') }}
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
        {{ $t('Home.Cp_QXBk3uXo20U6wMcUUU') }}
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
      { text: this.$t('Home._VJ621gBwFLfZZ34rnaHL'), img: 'actions.webp' },
      { text: this.$t('Home.iZlOv0hl46b8FEd8hg8s3'), img: 'auditable.webp' },
      { text: this.$t('Home.QWoZj1vRIxYuF9u7qloDy'), img: 'automated-dice-rolls.webp' },
      { text: this.$t('Home.jU4R7rz0mw_EnVTN8Xr5E'), img: 'build-system.webp' },
      { text: this.$t('Home.Ixxwar7dgi3ZBPT0lvBkz'), img: 'inventory.webp' },
      { text: this.$t('Home.BSKepuOqxaS6dcmfX5Y-J'), img: 'libraries-of-content.webp' },
      { text: this.$t('Home.NfNxTphXfuGzoeFs5Uht2'), img: 'send-to-discord.webp' },
      { text: this.$t('Home._4yZPmCb1C06LE_hlL1th'), img: 'printing.webp' },
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
