<template lang="html">
  <v-list-item
    class="hit-dice-list-tile"
    :class="{hover}"
  >
    <v-list-item-action class="mr-4">
      <v-layout
        align-center
        class="float-left"
      >
        <v-layout
          column
          class="buttons"
          justify-center
        >
          <v-btn
            icon
            small
            :disabled="model.value >= model.total || context.editPermission === false"
            @click="increment(1)"
          >
            <v-icon>mdi-chevron-up</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            :disabled="model.value <= 0 || context.editPermission === false"
            @click="increment(-1)"
          >
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </v-layout>

        <v-layout align-end>
          <div class="text-h4">
            {{ model.value }}
          </div>
          <div class="text-h6 max-value ml-2">
            /{{ model.total }}
          </div>
        </v-layout>
      </v-layout>
    </v-list-item-action>

    <v-list-item-content
      class="content"
      @click="click"
      @mouseover="hover = true"
      @mouseleave="hover = false"
    >
      <v-list-item-title>
        {{ model.hitDiceSize }} {{ signedConMod }}
      </v-list-item-title>
    </v-list-item-content>
  </v-list-item>
</template>

<script lang="js">
import numberToSignedString from '../../../../../api/utility/numberToSignedString';
export default {
  inject: {
    context: { default: {} }
  },
  props: {
    model: {
      type: Object,
      required: true,
    }
  },
  data() {
    return {
      hover: false,
    }
  },
  computed: {
    signedConMod() {
      return numberToSignedString(this.model.constitutionMod);
    },
  },
  methods: {
    click(e) {
      this.$emit('click', e);
    },
    increment(value) {
      this.$emit('change', { type: 'increment', value })
    },
  },
};
</script>

<style lang="css" scoped>
.hit-dice-list-tile {
  background: inherit;
}

.hit-dice-list-tile>>>.v-list__tile {
  height: 88px;
}

.left {
  height: 100%;
}

.buttons {
  height: 100%;
}

.buttons>.v-btn {
  margin: 0;
}

.hit-dice-list-tile.hover {
  background: #f5f5f5 !important;
}

.theme--dark .hit-dice-list-tile.hover {
  background: #515151 !important;
}

.content {
  cursor: pointer;
}

.max-value {
  color: rgba(0, 0, 0, .54);
}

.theme--dark .max-value {
  color: rgba(255, 255, 255, 0.54);
}
</style>
