import { z } from "zod";

export const PlatoonSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export type Platoon = z.infer<typeof PlatoonSchema>;

