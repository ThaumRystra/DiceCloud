<template>
  <div
    class="d-flex flex-column align-center justify-center fill-height"
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
        <template #default="props">
          <span v-if="props.days">
            {{ props.days }} days,
          </span>{{ props.hours }}:{{ formatNumber(props.minutes) }}:{{ formatNumber(props.seconds) }}
        </template>
      </countdown>
    </h1>
  </div>
</template>


<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import countdown from '@chenfengyuan/vue-countdown';
import LAUNCH_DATE from '/imports/constants/LAUNCH_DATE';

const router = useRouter();

const now = new Date();
const timeLeft = (LAUNCH_DATE as unknown as number) - now.getTime();
setTimeout(() => {
  router.push('/');
}, timeLeft);

const time = ref(timeLeft);

function formatNumber(num: number): string {
  return ('0' + num).slice(-2);
}
</script>
