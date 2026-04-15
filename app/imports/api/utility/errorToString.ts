export default function errorToString(error: unknown): string {
  if (error instanceof Meteor.Error) {
    if (error.reason) return error.reason;
    if (typeof error.error === 'string') return error.error;
    return error.error.toString();
  }
  if (error instanceof Error) {
    return error.message || error.name;
  }
  return String(error);
}
