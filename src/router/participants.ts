import { Hono } from "hono";
import { prisma } from "../utils/prisma.js";
import {
  createParticipantSchema,
  getQueryValidationParticipants,
  participantParamValidation,
  updateParticipantSchema,
} from "../validators/participant.validator.js";
import { zValidator } from "@hono/zod-validator";

export const participantsRoute = new Hono();

participantsRoute.get(
  "/",
  zValidator("query", getQueryValidationParticipants),
  async (c) => {
    try {
      const { eventId } = c.req.valid("query");

      const participants = await prisma.participant.findMany({
        where: { eventId },
      });
      return c.json({
        data: participants,
        message: "Participants fetched successfully",
      });
    } catch (error) {
      return c.json({ message: "Failed to fetch participants" }, 500);
    }
  }
);

participantsRoute.get(
  "/:id",
  zValidator("query", getQueryValidationParticipants),
  async (c) => {
    try {
      const id = c.req.param("id");

      const event = await prisma.event.findUnique({
        where: { id },
      });

      if (!event) {
        return c.json({ message: "Event not found" }, 404);
      }

      const participant = await prisma.participant.findUnique({
        where: { id },
        include: {
          event: true,
        },
      });

      if (!participant) {
        return c.json({ message: "Participant not found" }, 404);
      }

      return c.json({
        data: participant,
        message: "Participant fetched successfully",
      });
    } catch (error) {
      return c.json({ message: "Failed to fetch participant" }, 500);
    }
  }
);

participantsRoute.post(
  "/",
  zValidator("json", createParticipantSchema),
  async (c) => {
    try {
      const body = await c.req.json();

      const event = await prisma.event.findUnique({
        where: { id: body.eventId },
        include: {
          participants: true,
        },
      });

      if (!event) {
        return c.json({ message: "Event not found" }, 404);
      }

      if (event.participants.length >= event.capacity) {
        return c.json({ message: "Event is at full capacity" }, 400);
      }

      const participant = await prisma.participant.create({
        data: {
          ...body,
        },
      });

      return c.json(
        { data: participant, message: "Participant registered successfully" },
        201
      );
    } catch (error: any) {
      if (error.code === "P2002") {
        return c.json(
          { message: "Email already registered for this event" },
          400
        );
      }
      return c.json({ message: "Failed to register participant" }, 500);
    }
  }
);

participantsRoute.put(
  "/:id",
  zValidator("param", participantParamValidation),
  zValidator("json", updateParticipantSchema),
  async (c) => {
    try {
      const id = c.req.param("id");
      const body = await c.req.json();

      const existingParticipant = await prisma.participant.findUnique({
        where: { id },
      });
      if (!existingParticipant) {
        return c.json({ message: "Participant not found" }, 404);
      }

      const event = await prisma.event.findUnique({
        where: { id: existingParticipant.eventId },
      });

      if (!event) {
        return c.json({ message: "Event not found" }, 404);
      }

      const participant = await prisma.participant.update({
        where: { id },
        data: {
          ...body,
        },
      });

      return c.json({
        data: participant,
        message: "Participant updated successfully",
      });
    } catch (error: any) {
      if (error.code === "P2025") {
        return c.json({ message: "Participant not found" }, 404);
      }
      if (error.code === "P2002") {
        return c.json(
          { message: "Email already registered for this event" },
          400
        );
      }
      return c.json({ message: "Failed to update participant" }, 500);
    }
  }
);

participantsRoute.delete(
  "/:id",
  zValidator("param", participantParamValidation),
  async (c) => {
    try {
      const id = c.req.param("id");
      const participant = await prisma.participant.findUnique({
        where: { id },
      });
      if (!participant) {
        return c.json({ message: "Participant not found" }, 404);
      }

      await prisma.participant.delete({
        where: { id },
      });
      return c.json({ message: "Participant deleted successfully" });
    } catch (error: any) {
      if (error.code === "P2025") {
        return c.json({ message: "Participant not found" }, 404);
      }
      return c.json({ message: "Failed to delete participant" }, 500);
    }
  }
);
