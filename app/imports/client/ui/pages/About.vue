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
            {{ $t('About.KNjn21iiJo5DHGBgIQ3tl') }}
          </p>
        </v-layout>
      </v-parallax>
    </section>
    <section class="layout column align-center ma-2 mt-4">
      <div>
        <h3 class="text-h5 mb-2">
          {{ $t('About.1GLM0elvLeiwucyw3e5uR') }}
        </h3>
        <p>
          <b>Sam;</b> {{ $t('About.cAjcER2pzgHEO1GD-Op5I') }}
        </p><p>
          <b>{{ $t('About.YNa86X1J0jVs-V0NST3KH') }}</b> {{ $t('About.D8JQa8plAJK2RApywL269') }}
        </p>
        <h3 class="text-h6">
          {{ $t('About.HYoADNUbUvPIUel0poPoX') }}
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
      name: this.$t('About.hOiVfViXRJmSNmmImZtjS'),
      title: this.$t('About.UeguSsZrlTIc83c6rBSVb'),
      avatar: 'kira'
    },{
      name: this.$t('About.xqU-Vsk2W2N0TT_U27-62'),
      title: this.$t('About.m5HeWtWm_D9nmHi8pj01b'),
      avatar: 'satherian'
    },{
      name: this.$t('About.4QV9cqMWOd323dgeXpPCo'),
      title: this.$t('About.CrdaAyGFSpnBU7T-Og1eE'),
      avatar: 'vinton'
    },{
      name: this.$t('About.hlHatK1LPOfTe_86N4MbN'),
      title: this.$t('About.pVD6iUnr39mNwpPQlW1Wq'),
      avatar: 'lordOfJunk'
    },{
      name: this.$t('About.uF54mKfkoMk_c8vCeK0Yk'),
      title: this.$t('About.Lrh1aPjGD3MALdfGebrKh'),
      avatar: 'dai'
    }, {
      name: this.$t('About.fjyZXM3HxG6GZTi3YLLbQ'),
      title: this.$t('About.fYnP2TzDN7mwON9WkBT1c'),
      avatar: 'vibes'
    }, {
      name: this.$t('About.Zy6xUk3SJ9eEoWUu4QcJR'),
      title: this.$t('About.iC49nkwMzoit5rspime5y'),
      avatar: 'blue'
    },
    ],
  }},
}
</script>

<style lang="css" scoped>
</style>
