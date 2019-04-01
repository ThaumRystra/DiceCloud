<template lang="html">
	<dialog-base>
    <slot name="toolbar" slot="toolbar" :color="color">
			<div>
				{{doc.name}}
			</div>
    </slot>
		<slot/>
		<slot name="form" slot="edit" @update="update"/>
  </dialog-base>
</template>

<script>
import getCollectionByName from '/imports/api/parenting/getCollectionByName.js';
import fetchDocByRef from '/imports/api/parenting/fetchDocByRef.js';
import propertyUpdateMethods from '/imports/api/creature/properties/propertyUpdateMethods.js';
export default {
	props: {
		collection: String,
		id: String,
	},
	meteor: {
		doc(){
			return fetchDocByRef({
				id: this.id,
				collection: this.collection,
			});
		},
	},
	methods: {
		update(update, ack){
			propertyUpdateMethods[this.collection].call({
				_id: this.id,
				update,
			}, error => ack(error));
		}
	}
}
</script>

<style lang="css" scoped>
</style>
