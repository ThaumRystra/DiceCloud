<template>
  <div
    class="tabletop-viewer layout d-flex flex-wrap"
    style="flex-direction: row-reverse;"
  >
    <div
      class="tabletop-details pa-2"
      style="flex-basis: 500px; flex-grow: 999;"
    >
      <v-img
        v-if="model.imageUrl"
        :src="model.imageUrl"
        height="300"
        width="100%"
        content-class="reset-width"
      />
      <p
        v-if="model.description"
        class="mt-4"
      >
        <markdown-text :markdown="model.description" />
      </p>
    </div>
    <div
      class="sharing-details flex-grow-1 pa-2"
      style="flex-basis: 320px;"
    >
      <v-row dense>
        <property-field
          name="Owner"
          :cols="{ cols: 12 }"
        >
          {{ users.owner.username || users.owner._id || '' }}
        </property-field>
        <property-field
          v-if="users.gameMasters.length"
          name="Game Masters"
          :cols="{ cols: 12 }"
        >
          <li
            v-for="user in users.gameMasters"
            :key="user._id"
          >
            {{ user.username || user._id }}
          </li>
        </property-field>
        <property-field
          v-if="users.players.length"
          name="Players"
          :cols="{ cols: 12 }"
        >
          <li
            v-for="user in users.players"
            :key="user._id"
          >
            {{ user.username || user._id }}
          </li>
        </property-field>
        <property-field
          v-if="users.spectators.length"
          name="Spectators"
          :cols="{ cols: 12 }"
        >
          <li
            v-for="user in users.spectators"
            :key="user._id"
          >
            {{ user.username || user._id }}
          </li>
        </property-field>
      </v-row>
    </div>
  </div>
</template>

<script lang="js">
import MarkdownText from '/imports/client/ui/components/MarkdownText.vue';
import PropertyField from '/imports/client/ui/properties/viewers/shared/PropertyField.vue';

export default {
  name: 'TabletopViewer',
  components: {
    MarkdownText,
    PropertyField,
  },
  props: {
    model: {
      type: Object ,
      required: true,
    },
    users: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style>
.tabletop-viewer .reset-width {
  width: unset !important;
}
</style>
