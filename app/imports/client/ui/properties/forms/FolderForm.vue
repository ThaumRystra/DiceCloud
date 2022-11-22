<template lang="html">
  <div class="folder-form">
    <div class="layout wrap">
      <text-field
        ref="focusFirst"
        label="Name"
        style="flex-basis: 300px;"
        :value="model.name"
        :error-messages="errors.name"
        @change="change('name', ...arguments)"
      />
      <form-sections>
        <form-section
          v-if="$slots.children"
          name="Children"
        >
          <slot name="children" />
        </form-section>

        <form-section name="Advanced">
          <smart-combobox
            label="Tags"
            multiple
            chips
            deletable-chips
            :value="model.tags"
            @change="change('tags', ...arguments)"
          />
          <smart-switch
            label="Group children on a card"
            :value="model.groupStats"
            :error-messages="errors.groupStats"
            @change="change('groupStats', ...arguments)"
          />
          <v-expand-transition>
            <div v-if="model.groupStats">
              <smart-switch
                label="Hide children from stats tab"
                :value="model.hideStatsGroup"
                :error-messages="errors.hideStatsGroup"
                @change="change('hideStatsGroup', ...arguments)"
              />
              <smart-select
                clearable
                label="Tab"
                :items="[
                  { text: 'Stats Tab', value: 'stats' },
                  { text: 'Features Tab', value: 'features' },
                  { text: 'Actions Tab', value: 'actions' },
                  { text: 'Spells Tab', value: 'spells' },
                  { text: 'Inventory Tab', value: 'inventory' },
                  { text: 'Journal Tab', value: 'journal' },
                  { text: 'Build Tab', value: 'build' },
                ]"
                :value="model.tab"
                :error-messages="errors.tab"
                :menu-props="{auto: true, lazy: true}"
                @change="changeTab('tab', ...arguments)"
              />
              <smart-select
                clearable
                label="Location"
                :items="locationItems"
                :value="model.location"
                :error-messages="errors.location"
                :menu-props="{auto: true, lazy: true}"
                @change="change('location', ...arguments)"
              />
            </div>
          </v-expand-transition>
        </form-section>
      </form-sections>
    </div>
  </div>
</template>

<script lang="js">
import propertyFormMixin from '/imports/client/ui/properties/forms/shared/propertyFormMixin.js';
import FormSection from '/imports/client/ui/properties/forms/shared/FormSection.vue';

export default {
  components: {
    FormSection,
  },
  mixins: [propertyFormMixin],
  computed: {
    locationItems() {
      if (this.model.tab === 'stats') {
        return [
          { text: 'Start', value: 'start' },
          { text: 'After events', value: 'events' },
          { text: 'After stats', value: 'stats' },
          { text: 'After skills', value: 'skills' },
          { text: 'After proficiencies', value: 'proficiencies' },
          { text: 'End', value: 'end' },
        ];
      } else {
        return [
          { text: 'Start', value: 'start' },
          { text: 'End', value: 'end' },
        ];
      }
    }
  },
  methods: {
    changeTab(path, value, ack) {
      if (!Array.isArray(path)){
        path = [path];
      }
      if (
        value !== 'stats' &&
        (this.model.location !== 'start' && this.model.location !== 'end')
        || (!this.model.location && value)
      )
      this.$emit('change', {path: ['location'], value: 'start'});
      this.$emit('change', {path, value, ack});
    },
  }
};
</script>

<style lang="css" scoped>

</style>
