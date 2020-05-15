<template lang="html">
  <dialog-base>
    <template slot="toolbar">
      <property-icon
        :type="model.type"
        class="mr-2"
      />
      <v-toolbar-title class="title">
        {{ model.name || getPropertyName(model.type) }}
      </v-toolbar-title>
      <v-spacer />
      <v-menu
        v-if="editing"
        bottom
        left
        transition="slide-y-transition"
      >
        <template #activator="{ on }">
          <v-btn
            icon
            v-on="on"
          >
            <v-icon>more_vert</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-tile @click="remove">
            <v-list-tile-title>
              Delete <v-icon>delete</v-icon>
            </v-list-tile-title>
          </v-list-tile>
        </v-list>
      </v-menu>
      <v-btn
        icon
        @click="editing = !editing"
      >
        <v-slide-y-transition
          leave-absolute
          mode="out-in"
        >
          <v-icon
            v-if="editing"
            key="doneIcon"
          >
            done
          </v-icon>
          <v-icon
            v-else
            key="createIcon"
          >
            create
          </v-icon>
        </v-slide-y-transition>
      </v-btn>
    </template>
    <template v-if="model">
      <component
        :is="model.type + 'Form'"
        v-if="editing"
        class="creature-property-form"
        :model="model"
        @change="change"
        @push="push"
        @pull="pull"
      />
      <component
        :is="model.type + 'Viewer'"
        v-else-if="!editing && $options.components[model.type + 'Viewer']"
        class="creature-property-viewer"
        :model="model"
      />
      <p v-else>
        This property can't be viewed yet.
      </p>
      <template v-if="!editing">
        <v-divider />
        <creature-properties-tree
          v-if="!editing"
          :root="{collection: 'creatureProperties', id: model._id}"
          @selected="selectSubProperty"
        />
      </template>
    </template>
    <div
      slot="actions"
      class="layout row justify-end"
    >
      <v-btn
        flat
        @click="$store.dispatch('popDialogStack')"
      >
        Done
      </v-btn>
    </div>
  </dialog-base>
</template>

<script>
import CreatureProperties, {
	updateProperty,
	damageProperty,
	pushToProperty,
	pullFromProperty,
	softRemoveProperty,
} from '/imports/api/creature/CreatureProperties.js';
import Creatures from '/imports/api/creature/Creatures.js';
import DialogBase from '/imports/ui/dialogStack/DialogBase.vue';
import { getPropertyName } from '/imports/constants/PROPERTIES.js';
import PropertyIcon from '/imports/ui/properties/shared/PropertyIcon.vue';
import propertyFormIndex from '/imports/ui/properties/forms/shared/propertyFormIndex.js';
import propertyViewerIndex from '/imports/ui/properties/viewers/shared/propertyViewerIndex.js';
import CreaturePropertiesTree from '/imports/ui/creature/creatureProperties/CreaturePropertiesTree.vue';
import { get, findLast } from 'lodash';

let formIndex = {};
for (let key in propertyFormIndex){
	formIndex[key + 'Form'] = propertyFormIndex[key];
}

let viewerIndex = {};
for (let key in propertyViewerIndex){
	formIndex[key + 'Viewer'] = propertyViewerIndex[key];
}

export default {
	components: {
		...formIndex,
		...viewerIndex,
		PropertyIcon,
		DialogBase,
		CreaturePropertiesTree,
	},
	props: {
		_id: String,
		startInEditTab: Boolean,
	},
	data(){ return {
		editing: !!this.startInEditTab,
	}},
	meteor: {
		model(){
			return CreatureProperties.findOne(this._id);
		},
	},
  computed: {
    creature(){
      if (!this.model) return;
      let nearestCreatureAncestor = findLast(
        this.model.ancestors,
        ref => ref.collection === 'creatures'
      );
      if (!nearestCreatureAncestor) return;
      return Creatures.findOne(nearestCreatureAncestor.id);
    }
  },
  reactiveProvide: {
    name: 'computationContext',
    include: ['creature'],
  },
	methods: {
		getPropertyName,
		change({path, value, ack}){
			updateProperty.call({_id: this._id, path, value}, (error, result) =>{
        if (error) console.warn(error);
				ack && ack(error && error.reason || error);
			});
		},
		push({path, value, ack}){
			pushToProperty.call({_id: this._id, path, value}, (error, result) =>{
        if (error) console.warn(error);
				ack && ack(error && error.reason || error);
			});
		},
		pull({path, ack}){
			let itemId = get(this.model, path)._id;
			path.pop();
			pullFromProperty.call({_id: this._id, path, itemId}, (error, result) =>{
        if (error) console.warn(error);
				ack && ack(error && error.reason || error);
			});
		},
		remove(){
			softRemoveProperty.call({_id: this._id});
			this.$store.dispatch('popDialogStack');
		},
		selectSubProperty(_id){
			this.$store.commit('pushDialogStack', {
				component: 'creature-property-dialog',
				elementId: `tree-node-${_id}`,
				data: {_id},
			});
		}
	}
};
</script>

<style lang="css" scoped>
</style>
