import handler from "@tanstack/react-start/server-entry";
import { paraglideMiddleware } from "./paraglide/server.js";

/**
 * Wraps Start's server entry so every request resolves its locale
 * (url → cookie → Accept-Language → bg) before rendering.
 */
export default {
  fetch(req: Request): Promise<Response> {
    // Pass the ORIGINAL request: the router's rewrite option owns URL
    // mapping (deLocalizeUrl/localizeUrl); the middleware only resolves
    // locale context. De-localizing here too would double-rewrite and
    // cause a redirect loop.
    return paraglideMiddleware(req, () => handler.fetch(req));
  },
};
