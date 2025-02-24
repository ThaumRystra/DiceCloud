<template lang="html">
  <div class="class-viewer">
    <v-row dense>
      <property-field
        :name="$t('AttributeViewer.MNk7FUYtABwXmOJJeujzZ')"
        mono
        :value="model.variableName"
      />
      <property-field
        :name="$t('PropertyForm.reKPKGEnAfdHpBLoywE1w')"
        :value="model.slotCondition && (model.slotCondition.value || model.slotCondition.calculation)"
      />
      <property-field
        v-if="(model.slotTags && model.slotTags.length) || (model.extraTags && model.extraTags.length)"
        :name="$t('TagTargeting.o5IUFxjQjJTcdzzuShiuT')"
        :cols="{cols: 12}"
      >
        <div>
          <property-tags :tags="model.slotTags" />
          <div
            v-for="tags in model.extraTags"
            :key="tags._id"
          >
            <div class="text-caption">
              {{ tags.operation }}
            </div>
            <property-tags :tags="tags.tags" />
          </div>
        </div>
      </property-field>
      <property-field
        :name="$t('ClassViewer.tSWxRpWoywiupUiYO0z5j')"
        mono
        :value="model.missingLevels &&
          (model.missingLevels.length || undefined) &&
          model.missingLevels.join(', ')
        "
      />
      <property-field
        v-if="context.creatureId"
        :name="$t('CharacterCreationDialog.ALoCn8fXt0dv34QiFx1jx')"
        :value="model.level"
      />
      <property-field
        v-if="context.creatureId"
        :name="$t('BuildTab.lu8EqIIRQm8jcSn4TLxah')"
        :cols="{cols: 12}"
      >
        <v-btn
          outlined
          color="accent"
          data-id="level-up-btn"
          :disabled="model.slotCondition && model.slotCondition.hasOwnProperty('value') && !model.slotCondition.value"
          @click="levelUpDialog"
        >
          <v-icon left>
            mdi-plus
          </v-icon>
          <template v-if="model.missingLevels && model.missingLevels.length">
            {{ $t('BuildTab._TZnAe6ytMIX9JAOy_ws7') }} 
          </template>
          <template v-else>
            {{ $t('BuildTab.lu8EqIIRQm8jcSn4TLxah') }}
          </template> 
        </v-btn>
      </property-field>
      <property-description
        :name="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
        :model="model.description"
      />
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';

export default {
  mixins: [propertyViewerMixin],
  inject: {
    context: {
      default: {},
    },
  },
  methods: {
    levelUpDialog(){
      let classId = this.model._id;
      this.$store.commit('pushDialogStack', {
        component: 'level-up-dialog',
        elementId: 'level-up-btn',
        data: {
          creatureId: this.context.creatureId,
          classId: this.model._id,
        },
        callback(nodeIds){
          if (!nodeIds || !nodeIds.length) return;
          let newPropertyId = insertPropertyFromLibraryNode.call({
            nodeIds,
            parentRef: {
              'id': classId,
              'collection': 'creatureProperties',
            },
          });
          return `tree-node-${newPropertyId}`;
        }
      });
    },
  }
}
</script>

<style lang="css" scoped>
</style>
