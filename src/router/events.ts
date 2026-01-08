import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { prisma } from "../utils/prisma.js";
import {
  createEventSchema,
  updateEventSchema,
} from "../validators/event.validator.js";

export const eventsRoute = new Hono();

eventsRoute.get("/", async (c) => {
  try {
    const events = await prisma.event.findMany({
      include: {
        participants: true,
      },
    });
    return c.json({ data: events, message: "Events fetched successfully" });
  } catch (error) {
    return c.json({ message: "Failed to fetch events" }, 500);
  }
});

eventsRoute.get("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const event = await prisma.event.findFirst({
      where: { id },
      include: {
        participants: true,
      },
    });

    if (!event) {
      return c.json({ message: "Event not found" }, 404);
    }

    return c.json({ data: event, message: "Event fetched successfully" });
  } catch (error) {
    return c.json({ message: "Failed to fetch event" }, 500);
  }
});

eventsRoute.post("/", zValidator("json", createEventSchema), async (c) => {
  try {
    const body = await c.req.json();

    const event = await prisma.event.create({
      data: {
        ...body,
        date: new Date(body.date),
      },
    });

    return c.json({ data: event, message: "Event created successfully" }, 201);
  } catch (error: any) {
    return c.json({ message: "Failed to create event" }, 500);
  }
});

eventsRoute.put("/:id", zValidator("json", updateEventSchema), async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...body,
        date: body.date ? new Date(body.date) : undefined,
      },
    });

    return c.json({ data: event, message: "Event updated successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return c.json({ message: "Event not found" }, 404);
    }
    return c.json({ message: "Failed to update event" }, 500);
  }
});

eventsRoute.delete("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    await prisma.event.delete({
      where: { id },
    });

    return c.json({ message: "Event deleted successfully" });
  } catch (error: any) {
    if (error.code === "P2025") {
      return c.json({ message: "Event not found" }, 404);
    }
    return c.json({ message: "Failed to delete event" }, 500);
  }
});
