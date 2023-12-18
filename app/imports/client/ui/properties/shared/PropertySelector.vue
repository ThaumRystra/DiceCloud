<template lang="html">
  <div class="card-raised-background">
    <v-container fluid>
      <v-row
        wrap
        dense
        justify="center"
        justify-sm="start"
      >
        <template v-if="properties.suggested">
          <v-col cols="12">
            <v-subheader>
              Suggested
            </v-subheader>
          </v-col>
          <template v-for="(property, type) in properties.suggested">
            <v-col
              v-if="!noLibraryOnlyProps || !property.libraryOnly"
              :key="type"
              md="4"
              sm="6"
              cols="10"
            >
              <property-select-card
                :property="property"
                :disabled="type === currentType"
                @click="$emit('select', type)"
              />
            </v-col>
          </template>
        </template>
        <v-col
          v-if="properties.suggested"
          cols="12"
        >
          <v-subheader>
            More
          </v-subheader>
        </v-col>
        <template v-for="(property, type) in properties.more">
          <v-col
            v-if="!noLibraryOnlyProps || !property.libraryOnly"
            :key="type"
            md="4"
            sm="6"
            cols="10"
          >
            <property-select-card
              :property="property"
              :disabled="type === currentType"
              @click="$emit('select', type)"
            />
          </v-col>
        </template>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="js">
import PROPERTIES from '/imports/constants/PROPERTIES';
import PropertySelectCard from '/imports/client/ui/properties/shared/PropertySelectCard.vue';
export default {
  components: {
    PropertySelectCard,
  },
  props: {
    noLibraryOnlyProps: Boolean,
    parentType: {
      type: String,
      default: undefined,
    },
    suggestedTypes: {
      type: Array,
      default: undefined,
    },
    currentType: {
      type: String,
      default: undefined,
    }
  },
  data() {
    return {
      PROPERTIES,
    };
  },
  computed: {
    properties() {
      let suggested;
      let more = {};
      if (this.suggestedTypes) {
        for (const key in PROPERTIES) {
          let prop = PROPERTIES[key];
          if (this.suggestedTypes.includes(prop.type)) {
            if (!suggested) suggested = {};
            suggested[key] = prop;
          } else {
            more[key] = prop;
          }
        }
        return { suggested, more };
      } else if (this.parentType) {
        for (const key in PROPERTIES) {
          let prop = PROPERTIES[key];
          if (prop.suggestedParents.includes(this.parentType)) {
            if (!suggested) suggested = {};
            suggested[key] = prop;
          } else {
            more[key] = prop;
          }
        }
        return { suggested, more };
      } else {
        return { more: PROPERTIES };
      }
    },
  },
}
</script>

<style lang="css" scoped>

</style>
