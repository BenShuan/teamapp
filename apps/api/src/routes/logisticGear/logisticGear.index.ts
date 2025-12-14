import createRouter from "@/api/lib/create-router";
import * as handlers from "./logisticGear.handlers";
import * as routes from "./logisticGear.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.create, handlers.create)
  .openapi(routes.getOne, handlers.getOne)
  .openapi(routes.patch, handlers.patch)
  .openapi(routes.remove, handlers.remove);

export default router;
