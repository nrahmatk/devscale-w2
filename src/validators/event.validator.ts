import { z } from "zod";

export const createEventSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  date: z.string(),
  location: z.string().min(1, "Location is required"),
  capacity: z.number().int().positive("Capacity must be a positive number"),
});

export const updateEventSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.string().optional(),
  location: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
