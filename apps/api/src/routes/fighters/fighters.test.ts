// import {
//   applyD1Migrations,
//   env,
// } from "cloudflare:test";
// import { testClient } from "hono/testing";
// import * as HttpStatusPhrases from "stoker/http-status-phrases";
// import { beforeAll, describe, expect, expectTypeOf, it } from "vitest";
// import { ZodIssueCode } from "zod";

// import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants";
// import createApp from "@/api/lib/create-app";

// import router from "./fighters.index";

// const client = testClient(createApp().route("/", router), env);

// describe("fighters routes", async () => {
//   beforeAll(async () => {
//     // @ts-expect-error test
//     await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
//   });

//   it("post /fighters validates the body when creating", async () => {
//     const response = await client.api.fighters.$post({
//       // @ts-expect-error test
//       json: {
//         done: false,
//       },
//     });
//     expect(response.status).toBe(422);
//     if (response.status === 422) {
//       const json = await response.json();
//       expect(json.error.issues[0].path[0]).toBe("name");
//       expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.REQUIRED);
//     }
//   });

//   const id = 1;
//   const name = "Learn vitest";

//   it("post /fighters creates a task", async () => {
//     const response = await client.api.fighters.$post({
//       json: {
//         name,
//         done: false,
//       },
//     });
//     expect(response.status).toBe(200);
//     if (response.status === 200) {
//       const json = await response.json();
//       expect(json.name).toBe(name);
//       expect(json.done).toBe(false);
//     }
//   });

//   it("get /fighters lists all fighters", async () => {
//     const response = await client.api.fighters.$get();
//     expect(response.status).toBe(200);
//     if (response.status === 200) {
//       const json = await response.json();
//       expectTypeOf(json).toBeArray();
//       expect(json.length).toBe(1);
//     }
//   });

//   it("get /fighters/{id} validates the id param", async () => {
//     const response = await client.api.fighters[":id"].$get({
//       param: {
//         // @ts-expect-error test
//         id: "wat",
//       },
//     });
//     expect(response.status).toBe(422);
//     if (response.status === 422) {
//       const json = await response.json();
//       expect(json.error.issues[0].path[0]).toBe("id");
//       expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
//     }
//   });

//   it("get /fighters/{id} returns 404 when task not found", async () => {
//     const response = await client.api.fighters[":id"].$get({
//       param: {
//         id: 999,
//       },
//     });
//     expect(response.status).toBe(404);
//     if (response.status === 404) {
//       const json = await response.json();
//       expect(json.message).toBe(HttpStatusPhrases.NOT_FOUND);
//     }
//   });

//   it("get /fighters/{id} gets a single task", async () => {
//     const response = await client.api.fighters[":id"].$get({
//       param: {
//         id,
//       },
//     });
//     expect(response.status).toBe(200);
//     if (response.status === 200) {
//       const json = await response.json();
//       expect(json.name).toBe(name);
//       expect(json.done).toBe(false);
//     }
//   });

//   it("patch /fighters/{id} validates the body when updating", async () => {
//     const response = await client.api.fighters[":id"].$patch({
//       param: {
//         id,
//       },
//       json: {
//         name: "",
//       },
//     });
//     expect(response.status).toBe(422);
//     if (response.status === 422) {
//       const json = await response.json();
//       expect(json.error.issues[0].path[0]).toBe("name");
//       expect(json.error.issues[0].code).toBe(ZodIssueCode.too_small);
//     }
//   });

//   it("patch /fighters/{id} validates the id param", async () => {
//     const response = await client.api.fighters[":id"].$patch({
//       param: {
//         // @ts-expect-error test
//         id: "wat",
//       },
//       json: {},
//     });
//     expect(response.status).toBe(422);
//     if (response.status === 422) {
//       const json = await response.json();
//       expect(json.error.issues[0].path[0]).toBe("id");
//       expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
//     }
//   });

//   it("patch /fighters/{id} validates empty body", async () => {
//     const response = await client.api.fighters[":id"].$patch({
//       param: {
//         id,
//       },
//       json: {},
//     });
//     expect(response.status).toBe(422);
//     if (response.status === 422) {
//       const json = await response.json();
//       expect(json.error.issues[0].code).toBe(ZOD_ERROR_CODES.INVALID_UPDATES);
//       expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.NO_UPDATES);
//     }
//   });

//   it("patch /fighters/{id} updates a single property of a task", async () => {
//     const response = await client.api.fighters[":id"].$patch({
//       param: {
//         id,
//       },
//       json: {
//         done: true,
//       },
//     });
//     expect(response.status).toBe(200);
//     if (response.status === 200) {
//       const json = await response.json();
//       expect(json.done).toBe(true);
//     }
//   });

//   it("delete /fighters/{id} validates the id when deleting", async () => {
//     const response = await client.api.fighters[":id"].$delete({
//       param: {
//         // @ts-expect-error test
//         id: "wat",
//       },
//     });
//     expect(response.status).toBe(422);
//     if (response.status === 422) {
//       const json = await response.json();
//       expect(json.error.issues[0].path[0]).toBe("id");
//       expect(json.error.issues[0].message).toBe(ZOD_ERROR_MESSAGES.EXPECTED_NUMBER);
//     }
//   });

//   it("delete /fighters/{id} removes a task", async () => {
//     const response = await client.api.fighters[":id"].$delete({
//       param: {
//         id,
//       },
//     });
//     expect(response.status).toBe(204);
//   });
// });
