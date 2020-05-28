<template lang="html">
  <div>
    <section>
      <v-parallax
        src="/images/paper-dice-crown-with-candy.png"
        height="400"
      >
        <v-layout
          column
          align-center
          justify-center
          class="white--text"
        >
          <p
            class="white--text ma-2 headline text-xs-center"
            style="max-width: 1200px;"
          >
            DiceCloud is a single-developer project started in 2014 with the aim of
            being a character sheet that stayed in sync between the DM and their
            players, and made it clear where every value in the sheet came from, and
            how it was calculated.
          </p>
        </v-layout>
      </v-parallax>
    </section>
    <section class="layout column align-center ma-2 mt-4">
      <div>
        <h3 class="headline mb-2">
          Special Thanks
        </h3>
        <p>
          <b>Sam</b> My fiancée, without whom DiceCloud could not hope to exist
        </p><p>
          <b>The "Heroes" of Asaea</b> The D&amp;D party whose joy was the fuel
          with which DiceCloud was powered
        </p>
        <h3 class="title">
          Paragon tier Patrons
        </h3>
        <v-list
          avatar
          two-line
          style="background: inherit;"
        >
          <v-list-tile
            v-for="paragon in paragons"
            :key="paragon.name"
          >
            <v-list-tile-avatar>
              <v-img :src="`/images/paragons/${paragon.avatar}.png`" />
            </v-list-tile-avatar>
            <v-list-tile-content>
              <v-list-tile-title>
                {{ paragon.name }}
              </v-list-tile-title>
              <v-list-tile-sub-title>
                {{ paragon.title }}
              </v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  data(){ return {
    paragons:[{
      name: 'Kira Ametrine',
      title: 'Cleric of Lewd',
      avatar: 'kira'
    },{
      name: 'Satherian',
      title: 'Defender of Naptime',
      avatar: 'satherian'
    },{
      name: 'Vinton',
      title: 'The Gravekeeper',
      avatar: 'vinton'
    }],
  }},
}
</script>

<style lang="css" scoped>
</style>
