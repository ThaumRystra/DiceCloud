declare namespace Meteor {
  interface User {
    subscribedLibraries: string[];
    subscribedLibraryCollections: string[];
    subscribedCharacters: string[];
    apiKey?: string | undefined;
    darkMode?: boolean | undefined;
    fileStorageUsed?: number | undefined;
    preferences?: {
      swapAbilityScoresAndModifiers?: boolean | undefined;
      hidePropertySelectDialogHelp?: boolean | undefined;
    } | undefined;
  }
}
