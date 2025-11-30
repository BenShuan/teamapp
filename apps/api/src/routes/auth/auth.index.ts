import createRouter from "@/api/lib/create-router";
import { register } from "./auth.routes";
import { registerHandler } from "./auth.handlers";

const router = createRouter().openapi(register, registerHandler);

export default router;