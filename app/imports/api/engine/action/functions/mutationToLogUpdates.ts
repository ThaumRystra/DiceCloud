import { Mutation } from '/imports/api/engine/action/tasks/TaskResult';

export default function mutationToLogUpdates(mutation: Mutation) {
  if (!mutation.contents) return [];
  const contents: any[] = [];
  for (const content of mutation.contents) {
    contents.push({
      ...content,
      targetIds: mutation.targetIds,
    });
  }
  return contents;
}
