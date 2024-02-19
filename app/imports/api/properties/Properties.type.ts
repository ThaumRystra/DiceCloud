import { TreeDoc } from '/imports/api/parenting/ChildSchema';

export default interface Property extends TreeDoc {
  _id: string
  _migrationError?: string
  tags: string[]
  icon?: {
    name: string
    shape: string
  },
  slotQuantityFilled?: number
}