import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { webhook } from "./telegram";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

http.route({
  handler: webhook,
  method: "POST",
  path: "/telegram/webhook",
});

export default http;
