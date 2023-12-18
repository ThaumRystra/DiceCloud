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

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'
import numberToSignedString from '../../../../api/utility/numberToSignedString';

export default {
  mixins: [propertyViewerMixin],
  computed: {
    reset() {
      let reset = this.model.reset
      if (reset === 'shortRest') {
        return `Reset${this.model.resetMultiplier && ' x' + this.model.resetMultiplier
          } on a short rest`;
      } else if (reset === 'longRest') {
        return `Reset${this.model.resetMultiplier && ' x' + this.model.resetMultiplier
          } on a long rest`;
      } else {
        return undefined;
      }
    }
  },
  methods: {
    numberToSignedString,
  }
}
</script>

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
