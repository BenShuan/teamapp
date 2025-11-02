
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { fighter } from "../db/schema/fighter";
import type { z } from "zod";


// Insert validator (runtime)
export const NewFighterSchema = createInsertSchema(fighter, {
});

// Select validator (useful for output shaping)
export const fighterSchema = createSelectSchema(fighter);


// Select validator (useful for output shaping)
export const UpdateFighterSchema = createUpdateSchema(fighter);


export type NewFighter = z.infer<typeof NewFighterSchema>;
export type UpdateFighter = z.infer<typeof UpdateFighterSchema>;
export type Fighter = z.infer<typeof fighterSchema>;
