<template lang="html">
  <div>
    <section>
      <v-parallax
        src="/images/paper-dice-crown.webp"
        height="300"
      >
        <v-layout
          column
          align-center
          justify-center
          class="white--text"
        >
          <p
            class="white--text ma-2 text-center"
            style="max-width: 1200px;"
          >
            {{ $t('pages.about.description') }}
          </p>
        </v-layout>
      </v-parallax>
    </section>
    <section class="layout column align-center ma-2 mt-4">
      <div>
        <h3 class="text-h5 mb-2">
          {{ $t('pages.about.specialThanks') }}
        </h3>
        <p>
          <b>Sam;</b> {{ $t('pages.about.sam') }}
        </p><p>
          <b>The "Heroes" of Asaea</b> {{ $t('pages.about.heroes') }}
        </p>
        <h3 class="text-h6">
          Paragon tier Patrons
        </h3>
        <v-list
          avatar
          two-line
          style="background: inherit;"
        >
          <v-list-item
            v-for="paragon in paragons"
            :key="paragon.name"
          >
            <v-list-item-avatar>
              <v-img :src="`/images/paragons/${paragon.avatar}.png`" />
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title>
                {{ paragon.name }}
              </v-list-item-title>
              <v-list-item-subtitle>
                {{ paragon.title }}
              </v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
    </section>
  </div>
</template>

<script lang="js">
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
    },{
      name: 'Lord of Junk',
      title: 'Archwizard of the Odd',
      avatar: 'lordOfJunk'
    },{
      name: 'Dai',
      title: 'A Kobold\'s Best Friend',
      avatar: 'dai'
    }, {
      name: 'Vibes',
      title: 'Kell of Nothing',
      avatar: 'vibes'
    }, {
      name: 'ßlue',
      title: 'Embodiment of Greed',
      avatar: 'blue'
    },
    ],
  }},
}
</script>

<style lang="css" scoped>
</style>
