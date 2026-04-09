<template lang="html">
  <dialog-base class="dependency-graph">
    <template #toolbar>
      <div>
        Dependency Graph
      </div>
    </template>
    <template #unwrapped-content>
      <div
        id="dependency-graph-container"
        ref="container"
        class="graph-container"
      />
    </template>
  </dialog-base>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { autorun } from 'vue-meteor-tracker';
import buildCreatureComputation from '/imports/api/engine/computation/buildCreatureComputation';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import computeCreatureComputation from '/imports/api/engine/computation/computeCreatureComputation';
import cytoscape from 'cytoscape';
import klay from 'cytoscape-klay';
import PROPERTIES from '/imports/constants/PROPERTIES';

cytoscape.use(klay);

const props = defineProps<{ creatureId: string }>();
const container = ref<HTMLElement | null>(null);

function getNodeName(node: any) {
  const model = node.data;
  if (!model) return node.id;
  if (model.name) return model.name;
  if (model.type === '_calculation') return model._key;
  const prop = (PROPERTIES as any)[model.type];
  if (model.type === 'classLevel' && model.name && model.level) return model.name + ' ' + model.level;
  return prop?.name || prop?.type || node.id;
}

function getLoopNodes(computation: any) {
  const loopNodes: string[] = [];
  if (!computation.errors) return loopNodes;
  computation.errors.forEach((err: any) => {
    if (err.type !== 'dependencyLoop') return;
    err.details?.nodes?.forEach((nodeId: string) => loopNodes.push(nodeId));
  });
  return loopNodes;
}

const { result: computation } = autorun(() => {
  const comp = buildCreatureComputation(props.creatureId);
  computeCreatureComputation(comp);
  return comp;
});

let cyInstance: any = null;

onMounted(() => {
  const comp = computation.value;
  if (!comp || !container.value) return;
  const nodes: any[] = [];
  const loopNodes = getLoopNodes(comp);
  comp.dependencyGraph.forEachNode(function (node: any) {
    nodes.push({
      data: {
        id: node.id,
        label: getNodeName(node) || node.id,
        variable: !node.data?.type,
        inLoop: loopNodes.includes(node.id),
        propId: node.data?._id,
        prop: node.data,
      },
    });
  });
  const edges: any[] = [];
  comp.dependencyGraph.forEachLink(function (link: any) {
    edges.push({
      data: {
        target: link.fromId,
        source: link.toId,
        linkType: link.data,
        inLoop: loopNodes.includes(link.fromId) && loopNodes.includes(link.toId),
      },
    });
  });
  cyInstance = cytoscape({
    container: container.value,
    boxSelectionEnabled: false,
    autounselectify: true,
    layout: {
      name: 'klay',
      nodeDimensionsIncludeLabels: false,
      klay: {
        addUnnecessaryBendpoints: false,
        aspectRatio: 1.6,
        direction: 'RIGHT',
        edgeRouting: 'ORTHOGONAL',
        edgeSpacingFactor: 0.5,
        feedbackEdges: true,
        inLayerSpacingFactor: 1.0,
        layoutHierarchy: true,
        linearSegmentsDeflectionDampening: 0.3,
        compactComponents: true,
        mergeEdges: false,
        mergeHierarchyCrossingEdges: false,
        nodeLayering: 'NETWORK_SIMPLEX',
        nodePlacement: 'LINEAR_SEGMENTS',
        spacing: 20,
        thoroughness: 12,
        separateConnectedComponents: true,
      },
    },
    style: [
      { selector: 'node', style: { 'content': 'data(label)', 'text-valign': 'center', 'text-halign': 'center', 'background-color': '#303030', 'text-background-color': '#303030', 'color': '#fff', 'text-background-opacity': 1, 'text-background-shape': 'roundrectangle', 'text-background-padding': 2, 'shape': 'round-rectangle', 'width': 80, 'height': 20, 'compound-sizing-wrt-labels': 'include', 'font-family': '"Roboto",sans-serif' } },
      { selector: (ele: any) => ele.data().variable, style: { 'color': '#f44336', 'font-family': 'monospace' } },
      { selector: (ele: any) => !!ele.data().propId, style: { 'background-color': '#B71C1C', 'text-background-color': '#B71C1C' } },
      { selector: 'edge', style: { 'width': 4, 'target-arrow-shape': 'triangle-backcurve', 'color': '#fff', 'text-opacity': 0.8, 'line-color': '#555', 'target-arrow-color': '#555', 'curve-style': 'unbundled-bezier', 'label': 'data(linkType)', 'text-rotation': 'autorotate', 'source-endpoint': 'outside-to-line-or-label', 'target-endpoint': 'outside-to-line-or-label' } },
      { selector: (ele: any) => ele.data().inLoop, style: { 'color': '#fff', 'background-color': '#FF6D00', 'text-background-color': '#FF6D00', 'line-color': '#FF6D00', 'target-arrow-color': '#FF6D00' } },
    ],
    elements: { nodes, edges },
  });
  cyInstance.on('tap', 'node', function (evt: any) { console.log(evt.target.data()); });
  cyInstance.on('tap', 'edge', function (evt: any) { console.log(evt.target.data()); });
});
</script>

<style lang="css">
  .graph-container {
    width: 100%;
    height: 100%;
    background-color: #151515;
  }

  .graph-container svg {
    width: 100%;
    height: 100%;
  }
</style>
