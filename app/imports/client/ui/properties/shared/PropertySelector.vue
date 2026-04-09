<template lang="html">
  <div class="card-raised-background">
    <v-container fluid>
      <v-row
        wrap
        density="compact"
        justify="center"
        justify-sm="start"
      >
        <template v-if="properties.suggested">
          <v-col cols="12">
            <v-list-subheader>
              Suggested
            </v-list-subheader>
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
          <v-list-subheader>
            More
          </v-list-subheader>
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

<script setup lang="ts">
import { computed } from 'vue';
import PROPERTIES from '/imports/constants/PROPERTIES';
import PropertySelectCard from '/imports/client/ui/properties/shared/PropertySelectCard.vue';

const props = withDefaults(defineProps<{
  noLibraryOnlyProps?: boolean;
  parentType?: string;
  suggestedTypes?: string[];
  currentType?: string;
}>(), {
  noLibraryOnlyProps: false,
  parentType: undefined,
  suggestedTypes: undefined,
  currentType: undefined,
});

const properties = computed(() => {
  let suggested: Record<string, any> | undefined;
  let more: Record<string, any> = {};
  if (props.suggestedTypes) {
    for (const key in PROPERTIES) {
      const prop = (PROPERTIES as any)[key];
      if (props.suggestedTypes.includes(prop.type)) {
        if (!suggested) suggested = {};
        suggested[key] = prop;
      } else {
        more[key] = prop;
      }
    }
    return { suggested, more };
  } else if (props.parentType) {
    for (const key in PROPERTIES) {
      const prop = (PROPERTIES as any)[key];
      if (prop.suggestedParents.includes(props.parentType)) {
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
});
</script>

<style lang="css" scoped>

</style>
