<template>
  <v-layout class="dialog-stack" column aligned-center justified-center>
    <div class="backdrop"></div>
    <div class="dialog-sizer">
      <v-card
        class="dialog"
        v-for="dialog in dialogs"
        :key="dialog.key"
      >
        <component :is="component"></component>
      </v-card>
    </div>
  </v-layout>
</template>

<script>
  
</script>
