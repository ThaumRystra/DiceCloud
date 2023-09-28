<template>
  <v-layout
    column
    align-center
    justify-center
    class="fill-height"
  >
    <h1>
      DiceCloud version 2 beta will launch in
    </h1>
    <h1 style="font-size: 64px;">
      <countdown
        :time="time"
        :interval="100"
        tag="p"
      >
        <template slot-scope="props">
          <span v-if="props.days">
            {{ props.days }} days,
          </span>{{ props.hours }}:{{ formatNumber(props.minutes) }}:{{ formatNumber(props.seconds) }}
        </template>
      </countdown>
    </h1>
  </v-layout>
</template>


<script lang="js">
  import VueCountdown from '@chenfengyuan/vue-countdown';
  import LAUNCH_DATE from '/imports/constants/LAUNCH_DATE';
  export default{
    components:{
      countdown: VueCountdown,
    },
    data: function () {
      let now = new Date();
      let timeLeft = LAUNCH_DATE - now
      setTimeout(() => {
        this.$router.push('/');
      }, timeLeft);
      return {
        counting: false,
        time: timeLeft,
      };
    },
    methods: {
      formatNumber(num){
        return ('0' + num).slice(-2)
      }
    }
  }
</script>
