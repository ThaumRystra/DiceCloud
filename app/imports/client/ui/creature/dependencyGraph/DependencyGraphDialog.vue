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
import buildCreatureComputation from '/imports/api/engine/computation/buildCreatureComputation.js';
import DialogBase from '/imports/client/ui/dialogStack/DialogBase.vue';
import computeCreatureComputation from '/imports/api/engine/computation/computeCreatureComputation.js';
import cytoscape from 'cytoscape';
import klay from 'cytoscape-klay';
import PROPERTIES from '/imports/constants/PROPERTIES.js';

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
    console.log(this.computation);
    const loopNodes = getLoopNodes(this.computation);
    this.computation.dependencyGraph.forEachNode(function (node) {
      nodes.push({
        data: {
          id: node.id,
          label: getNodeName(node) || node.id,
          variable: !node.data,
          inLoop: loopNodes.includes(node.id),
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
          inLoop: loopNodes.includes(link.fromId) && loopNodes.includes(link.toId)
        },
        scratch: {
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
          // direction: 'RIGHT',
          edgeRouting: 'ORTHOGONAL', //'ORTHOGONAL',
          feedbackEdges: true,
          compactComponents: true,
          layoutHierarchy: true,
          mergeEdges: true,
          // mergeHierarchyCrossingEdges: true,
          nodePlacement: 'LINEAR_SEGMENTS', //default 'BRANDES_KOEPF'
          spacing: 20,//20,
          edgeSpacingFactor: 2.0, //0.5,
          thoroughness: 12,//7,
          separateConnectedComponents: false,
        },
      },

      style: [
        {
          selector: 'node',
          style: {
            'content': 'data(label)',
            //'text-opacity': 0.5,
            'text-valign': 'bottom',
            'text-halign': 'center',
            'background-color': '#11479e',
            //'text-outline-color': '#888',
            //'text-outline-width': 3,
            'text-background-opacity': 1,
            'text-background-color': '#888',
            'text-background-shape': 'roundrectangle',
            'shape': 'round-rectangle'
          }
        }, {
          selector: ele => ele.data().variable,
          style: {
            'background-color': '#B71C1C',
          }
        }, {
          selector: 'edge',
          style: {
            'width': 4,
            'target-arrow-shape': 'triangle-backcurve',
            'line-color': '#9dbaea',
            'target-arrow-color': '#9dbaea',
            'curve-style': 'unbundled-bezier',
            'label': 'data(linkType)',
            'text-rotation': 'autorotate',
          }
        }, {
          selector: ele => ele.data().inLoop,
          style: {
            'background-color': '#FF6D00',
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
      console.log( 'tapped node', node.data() );
    });
    this.cytoscape.on('tap', 'edge', function(evt){
      var edge = evt.target;
      console.log( 'tapped edge', edge );
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
  }

  .graph-container svg {
    width: 100%;
    height: 100%;
  }
</style>