<template>
  <div class="property-form">
    <v-row>
      <v-col
        cols="12"
        class="d-flex flex-wrap-reverse justify-end"
        style="gap: 8px"
      >
        <text-field
          v-if="schemaHasName"
          ref="focusFirst"
          :label="$t('TabletopForm.ogp8pUXHP7GwzGUlEkqSF')"
          style="flex-basis: 320px;"
          :value="model.name"
          :error-messages="errors.name"
          @change="(value, ack) => $emit('change', {path: ['name'], value, ack})"
        />
        <icon-color-menu
          :model="model"
          @change="e => $emit('change', e)"
        />
      </v-col>
    </v-row>
    <component
      :is="model.type"
      class="creature-property-form mb-4"
      :model="model"
      :errors="errors"
      @change="e => $emit('change', e)"
      @push="e => $emit('push', e)"
      @pull="e => $emit('pull', e)"
    >
      <form-section
        v-if="context.isLibraryForm"
        :name="$t('SingleLibrary.8o8zfT4rnslD95pstr578')"
      >
        <v-row
          v-if="context.isLibraryForm"
          dense
        >
          <v-col
            cols="12"
            md="6"
          >
            <smart-switch
              :label="$t('PropertyForm.XXwZiSyy3PLlHms5-hiEq')"
              :value="model.fillSlots"
              :error-messages="errors.fillSlots"
              @change="(value, ack) => $emit('change', {path: ['fillSlots'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <smart-switch
              :label="$t('PropertyForm.MZRFbTU4dQcWdpVlXv9ah')"
              :value="model.searchable"
              :error-messages="errors.searchable"
              @change="(value, ack) => $emit('change', {path: ['searchable'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <smart-select
              :label="$t('PropertyForm.nN8qiVQXkc18VOhirptoM')"
              style="flex-basis: 300px;"
              clearable
              :hint="$t('PropertyForm.G_YfY3xbu2WYu8bzJgULO')"
              :items="slotTypes"
              :value="model.slotFillerType"
              :error-messages="errors.slotFillerType"
              @change="(value, ack) => $emit('change', {path: ['slotFillerType'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <text-field
              :label="$t('PropertyForm.rOdph7uHJPkuF3rKxLiUA')"
              type="number"
              min="0"
              :hint="$t('PropertyForm.ACu_jRxz32qDAe16Wit4A')"
              :value="model.slotQuantityFilled"
              :error-messages="errors.slotQuantityFilled"
              @change="(value, ack) => $emit('change', {path: ['slotQuantityFilled'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <text-field
              v-if="context.isLibraryForm"
              :label="$t('PropertyForm.reKPKGEnAfdHpBLoywE1w')"
              :hint="$t('PropertyForm.Mn4WP5-Y0QLyoAm-5cO1-')"
              placeholder="$t('PropertyForm.M6byRruoaG1QJnLgCQJzH')"
              :value="model.slotFillerCondition"
              :error-messages="errors.slotFillerCondition"
              @change="(value, ack) => $emit('change', {path: ['slotFillerCondition'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <text-field
              v-if="context.isLibraryForm"
              :label="$t('PropertyForm.pfX-T7sDiiLNLZ4XYxmZe')"
              :hint="$t('PropertyForm.ll5VOZBvTaDkanqmhdxY4')"
              placeholder="$t('PropertyForm.xhQ1px8UKEwUfLt-2VIp_')"
              :value="model.slotFillerConditionNote"
              :error-messages="errors.slotFillerConditionNote"
              @change="(value, ack) => $emit('change', {path: ['slotFillerConditionNote'], value, ack})"
            />
          </v-col>
          <v-col
            cols="12"
          >
            <smart-combobox
              :label="$t('PropertyForm.hRA5h3_UC9k3Zk3iFywu8')"
              multiple
              small-chips
              deletable-chips
              :hint="$t('PropertyForm.F0m6HGixfZz0PawzG6Mm9')"
              :value="model.libraryTags"
              :error-messages="errors.libraryTags"
              @change="(value, ack) => $emit('change', {path: ['libraryTags'], value, ack})"
            />
          </v-col>
        </v-row>
      </form-section>
    </component>
    <v-divider
      class="mt-10 mb-8"
    />
    <v-row>
      <v-col
        cols="12"
      >
        <smart-combobox
          :label="$t('PropertyForm.vAMpUe37OijnEHSpa_exs')"
          multiple
          small-chips
          deletable-chips
          :hint="$t('PropertyForm.sZAVdib4BS4JqbPjOd-hh')"
          :value="model.tags"
          :error-messages="errors.tags"
          @change="(value, ack) => $emit('change', {path: ['tags'], value, ack})"
        />
      </v-col>
    </v-row>
    <v-row
      class="mt-1"
      dense
    >
      <v-col
        cols="12"
        class="d-flex flex-wrap-reverse justify-end"
        style="gap: 8px"
      >
        <outlined-input
          :name="$t('PropertyViewer.sIjkFiqjLqnIGsWsdWtDC')"
          style="width: 100%"
          class="pa-2 no-hover"
        >
          <descendant-properties-tree
            style="width: 100%;"
            organize
            :model="model"
            :root="model.root"
            :collection="collection"
            @selected="e => $emit('select-sub-property', e)"
          />
          <v-btn
            v-for="suggestion in suggestedChildren"
            :key="suggestion.type"
            :disabled="noChildInsert"
            tile
            plain
            :data-id="`insert-${suggestion.type}-property-btn`"
            @click="$event => $emit('add-child', {suggestedType: suggestion.type, elementId: `insert-${suggestion.type}-property-btn`})"
          >
            <v-icon left>
              mdi-plus
            </v-icon>
            {{ suggestion.details.name }}
          </v-btn>
          <v-btn
            :disabled="noChildInsert || context.editPermission === false"
            tile
            plain
            data-id="insert-any-property-btn"
            @click="$event => $emit('add-child', {elementId: 'insert-any-property-btn'})"
          >
            <v-icon
              v-if="!suggestedChildren.length"
              left
            >
              mdi-plus
            </v-icon>
            {{ suggestedChildren.length ? '...Other' : 'Child' }}
          </v-btn>
          <div
            v-if="noChildInsert"
            class="ma-2 text--disabled"
          >
            {{ $t('PropertyForm.-9Y-RPAarunJWnLeLkRe8') }}
          </div>
        </outlined-input>
      </v-col>
    </v-row>
  </div>
</template>

<script lang="js">
/*
  All of the shared fields common to all properties go in this form,
  property-specific forms are included as dynamic components
*/
import ComputedField from '/imports/client/ui/properties/forms/shared/ComputedField.vue';
import InlineComputationField from '/imports/client/ui/properties/forms/shared/InlineComputationField.vue';
import FormSection, { FormSections } from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import propertyFormIndex from '/imports/client/ui/properties/forms/shared/propertyFormIndex';
import IconColorMenu from '/imports/client/ui/properties/forms/shared/IconColorMenu.vue';
import DescendantPropertiesTree from '/imports/client/ui/creature/creatureProperties/DescendantPropertiesTree.vue';
import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';
import { getSuggestedChildren } from '/imports/constants/PROPERTIES';
import PROPERTIES from '/imports/constants/PROPERTIES';
import propertySchemasIndex from '/imports/api/properties/computedPropertySchemasIndex';

const slotTypes = [];
for (let key in PROPERTIES) {
  slotTypes.push({ text: PROPERTIES[key].name, value: key });
}
    
export default {
  components: {
    ComputedField,
    InlineComputationField,
    FormSection,
    FormSections,
    IconColorMenu,
    DescendantPropertiesTree,
    OutlinedInput,
    ...propertyFormIndex,
  },
  inject: {
    context: { default: {} }
  },
  props: {
    model: {
      type: [Object, Array],
      default: () => ({}),
    },
    collection: {
      type: String,
      default: 'creatureProperties'
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
    embedded: Boolean, // This dialog is embedded in a page
    noChildInsert: Boolean, // Don't allow inserting of children in this form
  },
  data() {
    return {
      slotTypes,
    };
  },
  computed: {
    suggestedChildren() {
      if (!this.model?.type) return [];
      return getSuggestedChildren(this.model.type);
    },
    schemaHasName() {
      if (!this.model?.type) return true;
      const schema = propertySchemasIndex[this.model.type];
      return schema.allowsKey('name');
    }
  },
  mounted() {
    /** Disable auto-focus, it gets in the way more than it helps
    // Don't autofocus on mobile, it brings up the on-screen keyboard
    if (this.$vuetify.breakpoint.smAndDown) return;

    setTimeout(() => {
      if (this.$refs.focusFirst && this.$refs.focusFirst.focus) {
        this.$refs.focusFirst.focus()
      }
    }, 300);
    */
  },
  methods: {
    selectSubProperty(_id){
      this.$store.commit('pushDialogStack', {
        component: 'creature-property-dialog',
        elementId: `tree-node-${_id}`,
        data: {
          _id,
          startInEditTab: this.editing,
        },
      });
    },
  },
}
</script>
