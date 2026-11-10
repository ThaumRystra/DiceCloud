import { z } from 'zod';
import { logContentSchema } from '/imports/api/creature/log/logContentSchema.schema';

const blackbox = z.record(z.string(), z.unknown());

export const actionSchema = z.object({
  creatureId: z.string().max(32),
  rootPropId: z.string().max(32).optional(),
  tabletopId: z.string().max(32).optional(),
  task: blackbox,
  // Applied properties
  results: z
    .array(
      z.object({
        // The property and target ids popped off the task stack
        propId: z.string().max(32),
        targetIds: z.array(z.string().max(32)).default([]),
        // Changes that override the local scope
        scope: blackbox.optional(),
        // Changes that consume pushed values from the local scope
        popScope: blackbox.optional(),
        // Changes that push values to the local scope
        pushScope: blackbox.optional(),
        // database changes
        mutations: z
          .array(
            z.object({
              targetIds: z.array(z.string().max(32)),
              updates: z
                .array(
                  z.object({
                    propId: z.string().max(32),
                    // Required, because CreatureProperties.update requires a
                    // selector of { type }
                    type: z.string(),
                    set: blackbox.optional(),
                    inc: blackbox.optional(),
                  }),
                )
                .optional(),
              contents: z.array(logContentSchema).optional(),
            }),
          )
          .optional(),
      }),
    )
    .default([]),
});

export type ActionSchemaType = z.infer<typeof actionSchema>;
