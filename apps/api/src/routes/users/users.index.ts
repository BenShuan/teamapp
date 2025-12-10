import createRouter from "@/api/lib/create-router";
import { list, create, getOne, patch, remove, setTeams, setPlatoons } from "./users.routes";
import { list as listHandler, create as createHandler, getOne as getOneHandler, patch as patchHandler, remove as removeHandler, setTeams as setTeamsHandler, setPlatoons as setPlatoonsHandler } from "./users.handlers";

const router = createRouter()
  .openapi(list, listHandler)
  .openapi(create, createHandler)
  .openapi(getOne, getOneHandler)
  .openapi(patch, patchHandler)
  .openapi(remove, removeHandler)
  .openapi(setTeams, setTeamsHandler)
  .openapi(setPlatoons, setPlatoonsHandler);

export default router;