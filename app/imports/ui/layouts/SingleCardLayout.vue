<template
  lang="html"
  functional
>
  <div
    class="pa-4 layout column align-center"
    style="height: calc(100vh - 96px); display: flex;"
  >
    <v-card
      style="height: 100%; width: 100%; max-width: 1800px;"
    >
      <slot />
    </v-card>
  </div>
</template>
