<template>
  <div class="tabletop-form">
    <v-row dense>
      <v-col
        cols="12"
        md="6"
      >
        <text-field
          label="Name"
          :value="model.name"
          :error-messages="errors.name"
          :disabled="!editPermission"
          @change="(value, ack) => change('name', value, ack)"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <smart-image-input
          label="Picture URL"
          hint="A link to a cover image for this tabletop"
          :disabled="!editPermission"
          :value="model.imageUrl"
          :error-messages="errors.imageUrl"
          @change="(value, ack) => change('imageUrl', value, ack)"
        />
      </v-col>
      <v-col
        cols="12"
      >
        <text-area
          label="Description"
          :value="model.description"
          :disabled="!editPermission"
          @change="(value, ack) => change('description', value, ack)"
        />
      </v-col>
    </v-row>

    <form-sections type="tabletop">
      <form-section name="Sharing">
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <smart-select
              label="Who can view"
              :items="[
                {text: 'Only people I share with', value: 'false'},
                {text: 'Anyone with link', value: 'true'}
              ]"
              :value="!!model.public + ''"
              @change="(value, ack) => change('public', value === 'true', ack)"
            />
          </v-col>
          <v-col
            v-if="model.public" 
            cols="12"
            md="6"
          >
            <text-field
              readonly
              label="Link"
              :value="link"
            />
          </v-col>

          <v-col
            cols="12"
            class="mb-4 px-4"
          >
            <h3 class="mb-4">
              Add user
            </h3>
            <text-field
              label="Username or email"
              :value="userSearched"
              :debounce-time="300"
              :disabled="!editPermission"
              @change="(value, ack) => getUser({value, ack})"
            />
            <smart-select
              label="Permission"
              :items="[
                {text: 'Game Master', value: 'gameMaster'},
                {text: 'Player', value: 'player'},
                {text: 'Spectator', value: 'spectator'},
              ]"
              :value="newSharePermission"
              :disabled="!editPermission"
              @change="(value, ack) => { newSharePermission = value; ack();}"
            />
            <smart-btn
              class="ml-2 mt-2"
              single-click
              :disabled="userFoundState !== 'found' || !editPermission"
              @click="ack => updateSharing(userId, newSharePermission, ack)"
            >
              Share
            </smart-btn>
          </v-col>

          <property-field
            name="Owner"
            :cols="{cols: 12, md: 6}"
          >
            {{ users.owner.username || users.owner._id || '' }}
          </property-field>
          <v-col
            v-if="users.gameMasters.length"
            key="gameMasters"
            cols="12"
            md="6"
            class="mb-4"
          >
            <outlined-input name="Game Masters">
              <tabletop-user-list
                :users="users.gameMasters"
                :edit-permission="editPermission"
                :owner="model.owner"
                role="gameMaster"
                @set-role="e => $emit('update-sharing', e)"
              />
            </outlined-input>
          </v-col>

          <v-col
            v-if="users.players.length"
            key="players"
            cols="12"
            md="6"
            class="mb-4"
          >
            <outlined-input name="Players">
              <tabletop-user-list
                :users="users.players"
                :edit-permission="editPermission"
                :owner="model.owner"
                role="player"
                @set-role="e => $emit('update-sharing', e)"
              />
            </outlined-input>
          </v-col>

          <v-col
            v-if="users.spectators.length"
            key="spectators"
            cols="12"
            md="6"
            class="mb-4"
          >
            <outlined-input name="Spectators">
              <tabletop-user-list
                :users="users.spectators"
                :edit-permission="editPermission"
                :owner="model.owner"
                role="spectator"
                @set-role="e => $emit('update-sharing', e)"
              />
            </outlined-input>
          </v-col>
        </v-row>
      </form-section>
    </form-sections>
  </div>
</template>

<script lang="js">
import OutlinedInput from '/imports/client/ui/properties/viewers/shared/OutlinedInput.vue';
import TabletopUserList from '/imports/client/ui/tabletop/TabletopUserList.vue';
import PropertyField from '/imports/client/ui/properties/viewers/shared/PropertyField.vue';
import FormSection, { FormSections } from '/imports/client/ui/properties/forms/shared/FormSection.vue';
import SmartImageInput from '/imports/client/ui/components/global/SmartImageInput.vue';

export default {
  name: 'TabletopViewer',
  components: {
    OutlinedInput,
    TabletopUserList,
    PropertyField,
    FormSection,
    FormSections,
    SmartImageInput,
  },
  props: {
    model: {
      type: Object,
      required: true,
    },
    errors: {
      type: Object,
      default: () => ({}),
    },
    editPermission: {
      type: Boolean,
      required: true,
    },
    users: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      newSharePermission: 'player',
      userSearched: undefined,
      userFoundState: 'idle',
      userId: undefined,
    };
  },
  computed: {
    link() {
      return window.location.origin + this.$router.resolve({
        name: 'tabletop',
        params: { id: this.model._id },
      }).href
    }
  },
  methods: {
    change(path, value, ack) {
      this.$emit('change', { path, value, ack });
    },
    updateSharing(userId, role, ack) {
      this.$emit('update-sharing', { userId, role, ack});
    },
    getUser({ value, ack }) {
      this.userSearched = value;
      if (!value) {
        this.userFoundState = 'idle';
        ack();
        return;
      }
      Meteor.users.findUserByUsernameOrEmail.call({
        usernameOrEmail: value
      }, (error, result) => {
        if (error) {
          ack(error && error.reason || error);
          this.userFoundState = 'failed';
        } else {
          this.userId = result;
          if (result) {
            if (this.users.gameMasters.includes(result)) {
              this.userFoundState = 'failed';
              ack('User is already a game master');
            } else if (this.users.players.includes(result)) {
              this.userFoundState = 'failed';
              ack('User is already a player');
            } else if (this.users.spectators.includes(result)) {
              this.userFoundState = 'failed';
              ack('User is already a spectator');
            } else {
              this.userFoundState = 'found';
              ack();
            }
          } else {
            this.userFoundState = 'notFound';
            ack('User not found');
          }
        }
      });
    },
  }
}
</script>

