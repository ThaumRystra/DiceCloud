<template lang="html">
  <v-list-item
    class="spell-slot-list-tile"
    v-on="hasClickListener ? {click} : {}"
  >
    <v-list-item-content>
      <v-list-item-title>
        <div
          v-if="model.total > 4"
          class="layout value"
          style="align-items: baseline;"
        >
          <div
            style="font-weight: 500; font-size: 24px"
            class="current-value"
          >
            {{ model.value }}
          </div>
          <div class="ml-2 max-value">
            /{{ model.total }}
          </div>
        </div>
        <div
          v-else
          class="layout align-center slot-bubbles"
        >
          <v-icon
            v-for="i in model.total"
            :key="i"
          >
            {{
              i > model.value ?
                'mdi-radiobox-blank' :
                'mdi-radiobox-marked'
            }}
          </v-icon>
        </div>
      </v-list-item-title>
      <v-list-item-subtitle>
        {{ model.name }}
      </v-list-item-subtitle>
    </v-list-item-content>
    <v-list-item-avatar v-if="!hideCastButton">
      <v-btn
        icon
        text
        class="primary--text"
        :data-id="`spell-slot-cast-btn-${model._id}`"
        @click.stop="$emit('cast')"
      >
        <v-icon>$vuetify.icons.spell</v-icon>
      </v-btn>
    </v-list-item-avatar>
  </v-list-item>
</template>

<script lang="js">
import numberToSignedString from '/imports/ui/utility/numberToSignedString.js';
export default {
	props: {
		model: {
      type: Object,
      required: true,
    },
    dark: Boolean,
    hideCastButton: Boolean,
	},
	computed: {
    hasClickListener(){
      return this.$listeners && !!this.$listeners.click;
    },
	},
	methods: {
		signed: numberToSignedString,
		click(e){
			this.$emit('click', e);
		},
	},
};
</script>

<style lang="css" scoped>
	.spell-slot-list-tile {
		background: inherit;
	}
	.v-list__tile__action {
		width: 112px;
    flex-shrink: 0;
	}
	.spell-slot-list-tile.hover {
		background: #f5f5f5 !important;
	}
	.theme--dark .spell-slot-list-tile.hover {
		background: #515151 !important;
	}
	.content {
		cursor: pointer;
	}
	.max-value {
		color: rgba(0,0,0,.54);
	}
	.theme--dark .max-value {
		color: rgba(255, 255, 255, 0.54);
	}
</style>
