export default function sum(inputNode) {
  let node = inputNode.roll();
	if (node.type === 'numberArray'){
		let total = node.value.reduce((total, num) => total + num, 0);
		return new ConstantNode({type: 'number', value: total});
	} else {
		let errors = node.errors || [];
		errors.push(`Could not sum ${node.value}`);
		return new ConstantNode({
			type: 'uncompiledNode',
			value: node.value,
			errors,
		});
	}
}
