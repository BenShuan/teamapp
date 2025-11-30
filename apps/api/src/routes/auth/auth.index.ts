import createRouter from "@/api/lib/create-router";
import { register, meScope } from "./auth.routes";
import { registerHandler, meScopeHandler } from "./auth.handlers";

const router = createRouter()
  .openapi(register, registerHandler)
  .openapi(meScope, meScopeHandler);

export default router;