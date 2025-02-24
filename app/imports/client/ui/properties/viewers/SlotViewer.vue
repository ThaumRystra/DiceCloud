<template lang="html">
  <div class="slot-viewer">
    <v-row dense>
      <property-field
        :name="$t('AttributeViewer.MNk7FUYtABwXmOJJeujzZ')"
        mono
        :value="model.variableName"
      />
      <property-field
        :name="$t('SlotViewer.FywxjYDlOBu2Q4A2QWt9a')"
        :value="model.slotCondition && (model.slotCondition.value || model.slotCondition.calculation)"
      />
      <property-field
        :name="$t('SlotViewer.YeaR95LU7Hp_cR-LWFhoj')"
        :value="slotTypeName"
      />
      <property-field
        :name="$t('AttributeConsumedForm.UmwJU_8ntBz-N8i0UgvKd')"
        :calculation="model.quantityExpected"
      />
      <property-field
        :name="$t('SlotForm.WIu_0M9OtcK660CQC62B2')"
        :value="uniqueText"
      />
      <property-field
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
      <property-description
        :name="$t('TabletopForm.nOLcz4YcyQNTwJKSAWI0K')"
        :model="model.description"
      />
      <property-field
        v-if="context.creatureId && (!model.quantityExpected || !model.quantityExpected.value || model.spaceLeft)"
        :name="$t('SlotViewer.9WI9Itx7bsoWd7NrhZQya')"
        :cols="{cols: 12}"
      >
        <fill-slot-button :model="model">
          <v-icon left>
            mdi-plus
          </v-icon>
          {{ $t('SlotViewer.kaRJtkmHaLLLW56A5srsA') }}
        </fill-slot-button>
      </property-field>
    </v-row>
  </div>
</template>

<script lang="js">
import propertyViewerMixin from '/imports/client/ui/properties/viewers/shared/propertyViewerMixin'
import { getPropertyName } from '/imports/constants/PROPERTIES';
import FillSlotButton from '/imports/client/ui/creature/buildTree/FillSlotButton.vue';

export default {
  components: {
    FillSlotButton,
  },
  mixins: [propertyViewerMixin],
  inject: {
    context: {
      default: {},
    },
  },
  computed: {
    slotTypeName() {
      if (!this.model.slotType) return;
      return getPropertyName(this.model.slotType);
    },
    uniqueText() {
      if (!this.model.unique) return;
      return {
        uniqueInSlot: this.$t('SlotForm.85H-J_AvQcQHHk9W2-7y9'),
        uniqueInCreature: this.$t('SlotForm.dvHDVcG6MuKwp7mIIZ9cO'),
      }[this.model.unique];
    },
  },
};
</script>

