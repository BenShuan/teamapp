import createRouter from "@/api/lib/create-router";
import { list, create, getOne, patch, remove } from "./platoons.routes";
import { list as listHandler, create as createHandler, getOne as getOneHandler, patch as patchHandler, remove as removeHandler } from "./platoons.handlers";

const router = createRouter()
  .openapi(list, listHandler)
  .openapi(create, createHandler)
  .openapi(getOne, getOneHandler)
  .openapi(patch, patchHandler)
  .openapi(remove, removeHandler);

export default router;
