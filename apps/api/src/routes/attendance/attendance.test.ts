// import {
//   applyD1Migrations,
//   env,
// } from "cloudflare:test";
// import { testClient } from "hono/testing";
// import * as HttpStatusPhrases from "stoker/http-status-phrases";
// import { beforeAll, describe, expect, expectTypeOf, it } from "vitest";
// import { ZodIssueCode } from "zod";
//
// import { ZOD_ERROR_CODES, ZOD_ERROR_MESSAGES } from "@/api/lib/constants";
// import createApp from "@/api/lib/create-app";
//
// import router from "./attendance.index";
//
// const client = testClient(createApp().route("/", router), env);
//
// describe("attendance routes", async () => {
//   beforeAll(async () => {
//     // @ts-expect-error test
//     await applyD1Migrations(env.DB, env.TEST_MIGRATIONS);
//   });
//
//   it("post /attendance validates the body when creating", async () => {
//     const response = await client.api.attendance.$post({
//       // @ts-expect-error test
//       json: {
//       },
//     });
//     expect(response.status).toBe(422);
//     if (response.status === 422) {
//       const json = await response.json();
//       expect(json.error.issues[0].path[0]).toBe("fighterId");
//     }
//   });
//
//   // Additional tests can be added mirroring the fighters/teams tests
//});
