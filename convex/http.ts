import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { webhook } from "./telegram"; // module:telegram

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// module:telegram
http.route({
  handler: webhook,
  method: "POST",
  path: "/telegram/webhook",
});
// end-module:telegram

export default http;
