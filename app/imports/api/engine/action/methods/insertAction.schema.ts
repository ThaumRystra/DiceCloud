import { z } from 'zod';
import { actionSchema } from '/imports/api/engine/action/engineActions.schema';

export const insertActionArgsSchema = z.object({
  action: actionSchema,
});
