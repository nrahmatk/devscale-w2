import { z } from "zod";

export const getQueryValidationParticipants = z.object({
  eventId: z.string().trim(),
});

export const participantParamValidation = z.object({
  id: z.string().trim(),
});

export const createParticipantSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  phone: z.string().optional(),
  eventId: z.string().min(1, "Event ID is required"),
});

export const updateParticipantSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export type CreateParticipantInput = z.infer<typeof createParticipantSchema>;
export type UpdateParticipantInput = z.infer<typeof updateParticipantSchema>;
export type GetQueryValidationParticipants = z.infer<
  typeof getQueryValidationParticipants
>;
export type ParticipantParamValidation = z.infer<
  typeof participantParamValidation
>;
