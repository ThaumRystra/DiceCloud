<script setup lang="ts">
defineProps<{ model: Record<string, any> }>();
</script>

<template lang="html">
  <div class="buff-viewer">
    <!--<property-field
      name="Duration"
      :value="model.duration"
    />-->
    <v-row dense>
      <property-field
        v-if="model.target === 'self'"
        name="Target"
        value="Self"
      />
    </v-row>
    <v-row dense>
      <property-description
        name="Description"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<style lang="css" scoped>
.ability-value {
  font-weight: 600;
  font-size: 24px !important;
  color: rgba(0, 0, 0, 0.54);
}

.mod,
.ability-value {
  text-align: center;
  width: 100%;
}

.attribute-value {
  text-align: center;
}
</style>
