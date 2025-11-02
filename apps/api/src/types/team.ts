import { z } from "zod";
import { PlatoonSchema } from "./platoon";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod";
import { team } from "../db/schema/team";

export const TeamSchema = z.object({
  id: z.number(),
  teamNumber: z.number(),
  platoonId: PlatoonSchema.shape.id,
});

// Insert validator (runtime)
export const NewTeamSchema = createInsertSchema(team, {
});

// Select validator (useful for output shaping)
export const teamSchema = createSelectSchema(team);


// Select validator (useful for output shaping)
export const UpdateTeamSchema = createUpdateSchema(team);


export type NewTeam = z.infer<typeof NewTeamSchema>;
export type UpdateTeam = z.infer<typeof UpdateTeamSchema>;
export type Team = z.infer<typeof teamSchema>;