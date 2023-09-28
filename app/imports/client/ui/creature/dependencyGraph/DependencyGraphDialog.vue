<template lang="html">
  <dialog-base class="dependency-graph">
    <div slot="toolbar">
      Dependency Graph
    </div>
    <div
      id="dependency-graph-container"
      slot="unwrapped-content"
      ref="container"
      class="graph-container"
    />
  </dialog-base>
</template>

<script lang="js">
import buildCreatureComputation from '/imports/api/engine/computation/buildCreatureComputation';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import computeCreatureComputation from '/imports/api/engine/computation/computeCreatureComputation';
import cytoscape from 'cytoscape';
import klay from 'cytoscape-klay';
import PROPERTIES from '/imports/constants/PROPERTIES';

cytoscape.use(klay);

function getNodeName(node) {
  let model = node.data;
  if (!model) return node.id;
  if (model.name) return model.name;
  if (model.type === '_calculation') {
    return model._key;
  }
  let prop = PROPERTIES[model.type]
  if (model.type === 'classLevel' && model.name && model.level) {
    return model.name + ' ' + model.level
  }
  return prop?.name || prop?.type || node.id;
}

function getLoopNodes(computation) {
  const loopNodes = [];
  if (!computation.errors) return loopNodes;
  computation.errors.forEach(err => {
    if (err.type !== 'dependencyLoop') return;
    err.details?.nodes?.forEach(nodeId => loopNodes.push(nodeId));
  });
  return loopNodes;
}

export default {
  components: {
    DialogBase,
  },
  props: {
    creatureId: {
      type: String,
      required: true,
    }
  },
  mounted() {
    // Convert ngraph to cytoscape
    // Convert Nodes
    const nodes = [];
    const loopNodes = getLoopNodes(this.computation);
    this.computation.dependencyGraph.forEachNode(function (node) {
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
    // Convert edges
    const edges = [];
    this.computation.dependencyGraph.forEachLink(function (link) {
      edges.push({
        data: {
          target: link.fromId,
          source: link.toId,
          linkType: link.data,
          inLoop: loopNodes.includes(link.fromId) && loopNodes.includes(link.toId),
        },
      })
      //{ data: { source: 'n0', target: 'n1' } }
    });
    this.cytoscape = cytoscape({
      container: this.$refs.container,

      boxSelectionEnabled: false,
      autounselectify: true,

      layout: {
        name: 'klay',
        nodeDimensionsIncludeLabels: false,
        klay: {
          addUnnecessaryBendpoints: false,
          aspectRatio: 1.6,
          direction: 'RIGHT',
          edgeRouting: 'ORTHOGONAL', //'ORTHOGONAL',
          edgeSpacingFactor: 0.5,
          feedbackEdges: true,
          inLayerSpacingFactor: 1.0,
          layoutHierarchy: true,
          linearSegmentsDeflectionDampening: 0.3,
          compactComponents: true,
          mergeEdges: false,
          mergeHierarchyCrossingEdges: false,
          nodeLayering: 'NETWORK_SIMPLEX',
          nodePlacement: 'LINEAR_SEGMENTS', //default 'BRANDES_KOEPF'
          spacing: 20,//20,
          thoroughness: 12,//7,
          separateConnectedComponents: true,
        },
      },

      style: [
        {
          selector: 'node',
          style: {
            'content': 'data(label)',
            //'text-opacity': 0.8,
            'text-valign': 'center',
            'text-halign': 'center',
            'background-color': '#303030',
            'text-background-color': '#303030',
            'color': '#fff',
            //'text-outline-color': '#888',
            //'text-outline-width': 3,
            'text-background-opacity': 1,
            'text-background-shape': 'roundrectangle',
            'text-background-padding': 2,
            'shape': 'round-rectangle',
            'width': 80,
            'height': 20,
            'compound-sizing-wrt-labels': 'include',
            'font-family': '"Roboto",sans-serif',
          }
        }, {
          selector: ele => ele.data().variable,
          style: {
            'color': '#f44336',
            'font-family': 'monospace',
          }
        }, {
          selector: ele => !!ele.data().propId,
          style: {
            'background-color': '#B71C1C',
            'text-background-color': '#B71C1C',
          }
        }, {
          selector: 'edge',
          style: {
            'width': 4,
            'target-arrow-shape': 'triangle-backcurve',
            'color': '#fff',
            'text-opacity': 0.8,
            'line-color': '#555',
            'target-arrow-color': '#555',
            'curve-style': 'unbundled-bezier',//'unbundled-bezier',
            'label': 'data(linkType)',
            'text-rotation': 'autorotate',
            'source-endpoint': 'outside-to-line-or-label',
            'target-endpoint': 'outside-to-line-or-label',
          }
        }, {
          selector: ele => ele.data().inLoop,
          style: {
            'color': '#fff',
            'background-color': '#FF6D00',
            'text-background-color': '#FF6D00',
            'line-color': '#FF6D00',
            'target-arrow-color': '#FF6D00',
          }
        }, 
      ],

      elements: {
        nodes,
        edges,
      },
    });
    this.cytoscape.on('tap', 'node', function(evt){
      var node = evt.target;
      console.log( node.data() );
    });
    this.cytoscape.on('tap', 'edge', function(evt){
      var edge = evt.target;
      console.log( edge.data() );
    });
  },
  meteor: {
    computation() {
      const computation = buildCreatureComputation(this.creatureId);
      computeCreatureComputation(computation);
      return computation;
    },
  },
}
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