<template lang="html">
  <div class="buff-remover-viewer">
    <v-row dense>
      <property-field
        v-if="model.target === 'self'"
        name="Target"
        value="Self"
      />
      <template v-if="!model.targetParentBuff">
        <property-field
          v-if="model.target === 'self'"
          name="Target"
          value="Self"
        />
        <property-field
          name="When applied"
          :value="model.removeAll ? 'Remove all matching buffs' : 'Remove 1 matching buff'"
        />
        <property-field
          name="Targeted tags"
        >
          <div>
            <div class="d-flex flex-wrap">
              <v-chip
                v-for="(tag, index) in model.targetTags"
                :key="index"
                class="ma-1"
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
                  class="ma-1"
                >
                  {{ extraTag }}
                </v-chip>
              </div>
            </div>
          </div>
        </property-field>
      </template>
    </v-row>
  </div>
</template>

<script lang="js">
  import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'
  import numberToSignedString from '../../../../api/utility/numberToSignedString';

  export default {
    mixins: [propertyViewerMixin],
    computed: {
      reset(){
        let reset = this.model.reset
        if (reset === 'shortRest'){
          return `Reset${
            this.model.resetMultiplier && ' x' + this.model.resetMultiplier
          } on a short rest`;
        } else if (reset === 'longRest'){
          return `Reset${
            this.model.resetMultiplier && ' x' + this.model.resetMultiplier
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
  .mod, .ability-value {
    text-align: center;
    width: 100%;
  }
  .attribute-value {
    text-align: center;
  }
</style>
