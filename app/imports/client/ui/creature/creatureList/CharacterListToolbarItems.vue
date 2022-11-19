<template lang="html">
  <div>
    <creature-storage-stats />
    <archive-button />
  </div>
</template>

<script lang="js">
import CreatureStorageStats from '/imports/client/ui/creature/creatureList/CreatureStorageStats.vue';
import ArchiveButton from '/imports/client/ui/creature/creatureList/ArchiveButton.vue';

export default {
  components: {
    CreatureStorageStats,
    ArchiveButton,
  },
}
</script>

<style lang="css">
</style>
