import { propsByDocsPath } from '/imports/constants/PROPERTIES.js';


// Manual doc paths
const docPaths = [
  'computed-fields',
  'inline-calculations',
  'dependency-loops',
  'docs',
  'tags',
];
const docs = new Map();
docPaths.forEach(path => {
  docs.set(path, Assets.getText(`docs/${path}.md`))
});

// Doc paths for properties
propsByDocsPath.forEach(prop => {
  docs.set(prop.docsPath, Assets.getText(`docs/${prop.docsPath}.md`));
});

Meteor.publish('docs', function (path) {
  if (!path) {
    docs.forEach((text, path) => {
      this.added('docs', path, { text });
    });
  } else {
    const text = docs.get(path);
    if (text) {
      this.added('docs', path, { text });
    }
  }
  this.ready();
});
