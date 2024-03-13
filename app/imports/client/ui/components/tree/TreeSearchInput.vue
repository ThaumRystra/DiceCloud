<template lang="html">
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        v-bind="attrs"
        icon
        v-on="on"
      >
        <v-badge
          :content="numFilters"
          :value="numFilters"
          color="primary"
          overlap
        >
          <v-icon>mdi-magnify</v-icon>
        </v-badge>
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        Search
      </v-card-title>
      <v-card-text>
        <v-select
          v-model="typeFilterInput"
          outlined
          label="Type"
          :items="filterOptions"
          multiple
          clearable
          small-chips
          deletable-chips
        />
        <v-slide-x-transition group>
          <div
            v-for="(fieldFilter, index) in fieldFilters"
            :key="index"
            class="d-flex"
          >
            <v-text-field
              v-model="fieldFilter.field"
              class="text--mono"
              label="Field"
              outlined
            />
            <v-text-field
              v-model="fieldFilter.value"
              label="Text"
              class="ml-2"
              outlined
            />
            <v-btn
              v-if="fieldFilters.length > 1"
              icon
              @click="fieldFilters.splice(index, 1)"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </div>
        </v-slide-x-transition>
        <div
          v-if="fieldFilters.length < 5"
          class="d-flex"
        >
          <v-spacer />
          <v-btn
            icon
            @click="fieldFilters.push({name: '', value: undefined})"
          >
            <v-icon>mdi-plus</v-icon>
          </v-btn>
        </div>
        <v-card-actions>
          <v-btn
            text
            @click="
              fieldFilters = [{field: 'name', value: undefined}];
              typeFilterInput = [];
              menu = false;
            "
          >
            <v-icon left>
              mdi-close
            </v-icon>
            Clear
          </v-btn>
          <v-spacer />
          <v-btn
            text
            color="primary"
            @click="menu = false"
          >
            Find
          </v-btn>
        </v-card-actions>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script lang="js">
import PROPERTIES from '/imports/constants/PROPERTIES';
import escapeRegex from '/imports/api/utility/escapeRegex';

const filterOptions = [];
for (let key in PROPERTIES) {
  filterOptions.push({
    text: PROPERTIES[key].name,
    value: key,
  });
}

export default {
  props: {
    value: {
      type: Object,
      default: undefined,
    },
    isLibrary: {
      type: Boolean,
      default: false
    }
  },
  data(){return {
    typeFilterInput: [],
    fieldFilters: [{field: 'name', value: undefined}],
    menu: false,
  }},
  computed: {
    filter() {
      let filter = undefined;
      if (this.typeFilterInput?.length) {
        filter = filter || {};
        filter.type = {$in: this.typeFilterInput};
      }
      this.fieldFilters?.forEach(fieldFilter => {
        if (!fieldFilter.field || !fieldFilter.value) return;
        const search = { $regex: escapeRegex(fieldFilter.value), '$options': 'i' };
        filter = filter || {};
        if (fieldFilter.field.includes('.')) {
          // The user used dot notation, search exactly where they are looking
          filter[fieldFilter.field] = search;
        } else {
          // No dot notation, search fields and their likely sub-fields
          filter.$and = filter.$and || [];
          filter.$and.push({
            $or: [
              { [fieldFilter.field]: search },
              { [fieldFilter.field + '.calculation']: search },
              { [fieldFilter.field + '.text']: search },
            ],
          });
        }
      });
      return filter;
    },
    filterOptions() {
      return !this.isLibrary 
        ? filterOptions.filter(p => p.value !== 'reference')
        : filterOptions;
    },
    extraFields() {
      let extraFields = [];
      this.fieldFilters?.forEach(fieldFilter => {
        if (!fieldFilter.field || !fieldFilter.value) return;
        extraFields.push(fieldFilter.field);
      });
      return extraFields;
    },
    numFilters() {
      let numFilters = 0;
      if (this.typeFilterInput?.length) numFilters += 1;
      numFilters += this.extraFields.length;
      return numFilters;
    }
  },
  watch: {
    menu(val) {
      if (!val) {
        this.$emit('input', this.filter);
        this.$emit('extra-fields-changed', this.extraFields);
      }
    }
  },
}
</script>

<style lang="css" scoped>
</style>
