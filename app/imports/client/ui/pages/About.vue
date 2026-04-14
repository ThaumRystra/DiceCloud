<script setup lang="ts">
const paragons = [
  { name: 'Kira Ametrine', title: 'Cleric of Lewd', avatar: 'kira' },
  { name: 'Satherian', title: 'Defender of Naptime', avatar: 'satherian' },
  { name: 'Vinton', title: 'The Gravekeeper', avatar: 'vinton' },
  { name: 'Lord of Junk', title: 'Archwizard of the Odd', avatar: 'lordOfJunk' },
  { name: 'Dai', title: 'A Kobold\'s Best Friend', avatar: 'dai' },
  { name: 'Vibes', title: 'Kell of Nothing', avatar: 'vibes' },
  { name: 'ßlue', title: 'Embodiment of Greed', avatar: 'blue' },
];
</script>

<template lang="html">
  <div>
    <section>
      <v-parallax
        src="/images/paper-dice-crown.webp"
        height="300"
      >
        <div class="d-flex flex-column align-center justify-center text-white">
          <p
            class="text-white ma-2 text-center"
            style="max-width: 1200px;"
          >
            DiceCloud is a single-developer project started in 2014 with the aim of
            being a character sheet that stayed in sync between the DM and their
            players, and made it clear where every value in the sheet came from, and
            how it was calculated.
          </p>
        </div>
      </v-parallax>
    </section>
    <section class="d-flex flex-column align-center ma-2 mt-4">
      <div>
        <h3 class="text-h5 mb-2">
          Special Thanks
        </h3>
        <p>
          <b>Sam;</b> without her love, DiceCloud could not hope to exist
        </p><p>
          <b>The "Heroes" of Asaea</b> The D&amp;D party whose joy was the fuel
          powering the early versions of DiceCloud.
        </p>
        <h3 class="text-h6">
          Paragon tier Patrons
        </h3>
        <v-list
          style="background: inherit;"
        >
          <v-list-item
            v-for="paragon in paragons"
            :key="paragon.name"
          >
            <template #prepend>
              <v-avatar>
                <v-img :src="`/images/paragons/${paragon.avatar}.png`" />
              </v-avatar>
            </template>
            <v-list-item-title>
              {{ paragon.name }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ paragon.title }}
            </v-list-item-subtitle>
          </v-list-item>
        </v-list>
      </div>
    </section>
  </div>
</template>

<style lang="css" scoped>
</style>
