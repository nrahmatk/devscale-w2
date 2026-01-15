import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { eventsRoute } from "./router/events.js";
import { participantsRoute } from "./router/participants.js";

const app = new Hono();

app.use("*", cors());

app.route("/events", eventsRoute);
app.route("/participants", participantsRoute);

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  },
);