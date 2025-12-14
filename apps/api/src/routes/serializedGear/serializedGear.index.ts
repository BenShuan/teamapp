import createRouter from "@/api/lib/create-router";
import * as handlers from "./serializedGear.handlers";
import * as routes from "./serializedGear.routes";

const router = createRouter()
  .openapi(routes.listGear, handlers.listGear)
  .openapi(routes.createGear, handlers.createGear)
  .openapi(routes.getGear, handlers.getGear)
  .openapi(routes.patchGear, handlers.patchGear)
  .openapi(routes.removeGear, handlers.removeGear)
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove)
  .openapi(routes.bulkCheck, handlers.bulkCheck)
  .openapi(routes.createCheck, handlers.createCheck);

export default router;
