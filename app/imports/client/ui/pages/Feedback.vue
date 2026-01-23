<template lang="html">
  <div
    class="layout column align-center pa-2"
  >
    <v-card>
      <iframe
        src="https://discordapp.com/widget?id=120762305087668224&theme=dark"
        width="100%"
        height="500"
        allowtransparency="true"
        frameborder="0"
      />
      <v-card-title primary-title>
        <div>
          <h3 class="text-h5 mb-0">
            {{ $t('pages.feedback.discordServer') }}
          </h3>
          <div>
            {{ $t('pages.feedback.discordDescriptionServer') }}
          </div>
        </div>
      </v-card-title>
      <v-card-actions>
        <v-spacer />
        <v-btn
          text
          color="primary"
          href="https://discord.gg/qEvdfeB"
        >
          {{ $t('pages.feedback.join') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script lang="js">
export default {
}
</script>

<style lang="css" scoped>
</style>
