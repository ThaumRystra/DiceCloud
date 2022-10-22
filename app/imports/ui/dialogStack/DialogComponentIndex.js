// Load commonly used dialogs immediately
import AddCreaturePropertyDialog from '/imports/ui/creature/creatureProperties/AddCreaturePropertyDialog.vue';
import CharacterCreationDialog from '/imports/ui/creature/character/CharacterCreationDialog.vue';
import CastSpellWithSlotDialog from '/imports/ui/properties/components/spells/CastSpellWithSlotDialog.vue';
import CreatureFormDialog from '/imports/ui/creature/CreatureFormDialog.vue';
import CreaturePropertyCreationDialog from '/imports/ui/creature/creatureProperties/CreaturePropertyCreationDialog.vue';
import CreaturePropertyDialog from '/imports/ui/creature/creatureProperties/CreaturePropertyDialog.vue';
import CreaturePropertyFromLibraryDialog from '/imports/ui/creature/creatureProperties/CreaturePropertyFromLibraryDialog.vue';
import CreatureRootDialog from '/imports/ui/creature/character/CreatureRootDialog.vue';
import DeleteConfirmationDialog from '/imports/ui/dialogStack/DeleteConfirmationDialog.vue';
import ExperienceInsertDialog from '/imports/ui/creature/experiences/ExperienceInsertDialog.vue';
import ExperienceListDialog from '/imports/ui/creature/experiences/ExperienceListDialog.vue';
import HelpDialog from '/imports/ui/dialogStack/HelpDialog.vue';
import LevelUpDialog from '/imports/ui/creature/slots/LevelUpDialog.vue';
import SelectLibraryNodeDialog from '/imports/ui/library/SelectLibraryNodeDialog.vue';
import SlotFillDialog from '/imports/ui/creature/slots/SlotFillDialog.vue';
import TierTooLowDialog from '/imports/ui/user/TierTooLowDialog.vue';
import TransferOwnershipDialog from '/imports/ui/sharing/TransferOwnershipDialog.vue';

// Lazily load less common dialogs
const ArchiveDialog = () => import('/imports/ui/creature/archive/ArchiveDialog.vue');
const CastSpellWithSlotDialog = () => import('/imports/ui/properties/components/spells/CastSpellWithSlotDialog.vue');
const CharacterSheetDialog = () => import('/imports/ui/tabletop/CharacterSheetDialog.vue');
const CreatureFormDialog = () => import('/imports/ui/creature/CreatureFormDialog.vue');
const CreaturePropertyCreationDialog = () => import('/imports/ui/creature/creatureProperties/CreaturePropertyCreationDialog.vue');
const CreaturePropertyDialog = () => import('/imports/ui/creature/creatureProperties/CreaturePropertyDialog.vue');
const CreaturePropertyFromLibraryDialog = () => import('/imports/ui/creature/creatureProperties/CreaturePropertyFromLibraryDialog.vue');
const DeleteConfirmationDialog = () => import('/imports/ui/dialogStack/DeleteConfirmationDialog.vue');
const DeleteUserAccountDialog = () => import('/imports/ui/user/DeleteUserAccountDialog.vue');
const InviteDialog = () => import('/imports/ui/user/InviteDialog.vue');
const LibraryCollectionCreationDialog = () => import('/imports/ui/library/LibraryCollectionCreationDialog.vue');
const LibraryCollectionEditDialog = () => import('/imports/ui/library/LibraryCollectionEditDialog.vue');
const LibraryCreationDialog = () => import('/imports/ui/library/LibraryCreationDialog.vue');
const LibraryEditDialog = () => import('/imports/ui/library/LibraryEditDialog.vue');
const LibraryNodeCreationDialog = () => import('/imports/ui/library/LibraryNodeCreationDialog.vue');
const LibraryNodeDialog = () => import('/imports/ui/library/LibraryNodeDialog.vue');
const MoveLibraryNodeDialog = () => import('/imports/ui/library/MoveLibraryNodeDialog.vue');
const SelectCreaturesDialog = () => import('/imports/ui/tabletop/SelectCreaturesDialog.vue');
const ShareDialog = () => import('/imports/ui/sharing/ShareDialog.vue');
const UsernameDialog = () => import('/imports/ui/user/UsernameDialog.vue');

export default {
  AddCreaturePropertyDialog,
  ArchiveDialog,
  CastSpellWithSlotDialog,
  CharacterSheetDialog,
  CharacterCreationDialog,
  CreatureFormDialog,
  CreaturePropertyCreationDialog,
  CreaturePropertyDialog,
  CreaturePropertyFromLibraryDialog,
  CreatureRootDialog,
  DeleteConfirmationDialog,
  DeleteUserAccountDialog,
  ExperienceInsertDialog,
  ExperienceListDialog,
  HelpDialog,
  InviteDialog,
  LevelUpDialog,
  LibraryCollectionCreationDialog,
  LibraryCollectionEditDialog,
  LibraryCreationDialog,
  LibraryEditDialog,
  LibraryNodeCreationDialog,
  LibraryNodeDialog,
  MoveLibraryNodeDialog,
  SelectCreaturesDialog,
  SelectLibraryNodeDialog,
  ShareDialog,
  SlotFillDialog,
  TierTooLowDialog,
  TransferOwnershipDialog,
  UsernameDialog,
};
