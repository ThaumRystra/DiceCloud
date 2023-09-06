<template lang="html">
  <property-field
    v-if="model.targetByTags"
    name="Targeted tags"
  >
    <div 
      class="py-1"
    >
      <div class="d-flex flex-wrap">
        <v-chip
          v-for="(tag, index) in model.targetTags"
          :key="index"
          class="mr-1"
          disabled
          small
        >
          {{ tag }}
        </v-chip>
      </div>
      <div
        v-for="ex in model.extraTags"
        :key="ex._id"
      >
        <span class="ma-2">
          {{ ex.operation }}
        </span>
        <div class="d-flex flex-wrap">
          <v-chip
            v-for="(extraTag, index) in ex.tags"
            :key="index"
            class="mr-1"
            disabled
            small
          >
            {{ extraTag }}
          </v-chip>
        </div>
      </div>
    </div>
  </property-field>
</template>

<script lang="js">
import PropertyField from '/imports/client/ui/properties/viewers/shared/PropertyField.vue';

export default {
  components: {
    PropertyField,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
}
</script>