<template>
  <v-card
    v-if="model"
    v-bind="$attrs"
    :data-id="`slot-card-${model._id}`"
    :style="`border: solid 1px ${accentColor};`"
    hover
    class="slot-card d-flex flex-column"
    @mouseover="hover = true"
    @mouseleave="hover = false"
    @click="fillSlot"
  >
    <card-highlight 
      :active="hover"
    />
    <v-card-title>
      {{ model.name }}
    </v-card-title>
    <v-card-text v-if="model.description">
      <property-description
        text
        :model="model.description"
      />
    </v-card-text>
    <v-spacer />
    <v-card-actions>
      <v-spacer />
      <v-btn
        icon
        color="accent"
        @click.stop="ignoreProp"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="js">
import CardHighlight from '/imports/client/ui/components/CardHighlight.vue';
import PropertyDescription from '/imports/client/ui/properties/viewers/shared/PropertyDescription.vue';
import insertPropertyFromLibraryNode from '/imports/api/creature/creatureProperties/methods/insertPropertyFromLibraryNode';
import { snackbar } from '/imports/client/ui/components/snackbars/SnackbarQueue';
import updateCreatureProperty from '/imports/api/creature/creatureProperties/methods/updateCreatureProperty';

export default {
  components: {
    CardHighlight,
    PropertyDescription,
  },
  inject: {
    theme: {
      default: {
        isDark: false,
      },
    },
    context: {
      default: {},
    },
  },
  props: {
    model: {
      type: Object,
      default: undefined,
    },
  },
  data(){ return {
    hover: false,
  }},
  computed: {
    accentColor() {
      if (this.model.color) {
        return this.model.color
      } else if (this.theme.isDark){
        return this.$vuetify.theme.themes.dark.primary;
      } else {
        return this.$vuetify.theme.themes.light.primary;
      }
    }
  },
  methods: {
    fillSlot() {
      const slotId = this.model._id;
      this.$store.commit('pushDialogStack', {
        component: 'slot-fill-dialog',
        elementId: `slot-card-${slotId}`,
        data: {
          slotId,
          creatureId: this.context.creatureId,
        },
        callback(nodeIds){
          if (!nodeIds || !nodeIds.length) return;
          insertPropertyFromLibraryNode.call({
            nodeIds,
            parentRef: {
              'id': slotId,
              'collection': 'creatureProperties',
            },
          }, error => {
            if (error){
              console.error(error);
              snackbar({text: error.reason || error.message || error.toString()});
            }
          });
        }
      });
    },
    ignoreProp(){
      updateCreatureProperty.call({
        _id: this.model._id,
        path: ['ignored'],
        value: true
      }, error => {
        if (error){
          console.error(error);
          snackbar({text: error.reason || error.message || error.toString()});
        }
      });
    },
  }
}
</script>
