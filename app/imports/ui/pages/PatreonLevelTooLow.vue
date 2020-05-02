<template>
  <div>
    <v-layout
      column
      align-center
      justify-center
    >
      <h2 style="margin: 48px 28px 16px">
        Your current patreon support is ${{ entitledDollars }}.
      </h2>
      <h2 style="margin: 16px 28px">
        You need to pledge at least $5 to use this beta.
      </h2>
    </v-layout>
  </div>
</template>

<script>
export default {
  meteor: {
    entitledDollars(){
      let user = Meteor.user();
      if (!user) return 0;
      let entitledCents = user.services.patreon.entitledCents || 0;
      let overrideCents = user.services.patreon.entitledCentsOverride || 0;
      return Math.max(entitledCents, overrideCents)/100;
    }
  }
}
</script>
