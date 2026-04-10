/**
 * Seeds the local D1 database with Hebrew demo data.
 * Run from apps/api: pnpm db:seed:local
 * Prerequisites: pnpm db:migrate:local
 *
 * Options: --reset  Clear existing rows (safe order) before inserting.
 */
import { createHash, randomUUID } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { getPlatformProxy } from "wrangler";
import { drizzle } from "drizzle-orm/d1";

import {
  accounts,
  authenticators,
  platoon,
  team,
  users,
  userPlatoonMembership,
  userTeamMembership,
  fighter,
  attendance,
  serializedGear,
  serializedGearFighter,
  serializedGearCheck,
  logisticGear,
  sessions,
  verificationTokens,
} from "../src/db/schema/index.ts";
import { UserRole } from "../src/db/schema/auth.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

const DEMO_PASSWORD = "demo1234";
const RESET = process.argv.includes("--reset");

async function clearTables(db: ReturnType<typeof drizzle>) {
  await db.delete(serializedGearCheck);
  await db.delete(serializedGearFighter);
  await db.delete(attendance);
  await db.delete(logisticGear);
  await db.delete(userTeamMembership);
  await db.delete(userPlatoonMembership);
  await db.delete(fighter);
  await db.delete(serializedGear);
  await db.delete(team);
  await db.delete(sessions);
  await db.delete(accounts);
  await db.delete(authenticators);
  await db.delete(verificationTokens);
  await db.delete(users);
  await db.delete(platoon);
}

async function seed() {
  const configPath = path.join(__dirname, "..", "wrangler.toml");
  const { env, dispose } = await getPlatformProxy({
    configPath,
    persist: true,
  });

  const db = drizzle(env.DB, {
    schema: {
      platoon,
      team,
      users,
      userTeamMembership,
      userPlatoonMembership,
      fighter,
      attendance,
      serializedGear,
      serializedGearFighter,
      serializedGearCheck,
      logisticGear,
      accounts,
      sessions,
      verificationTokens,
      authenticators,
    },
  });

  try {
    if (RESET) {
      console.log("Clearing existing data (--reset)…");
      await clearTables(db);
    }

    const now = new Date().toISOString();
    const passwordHash = hashPassword(DEMO_PASSWORD);

    const platoonId = randomUUID();
    const teamAlphaId = randomUUID();
    const teamBravoId = randomUUID();

    const adminUserId = randomUUID();
    const cmdUserId = randomUUID();

    console.log("Inserting platoons, teams, users…");

    await db.insert(platoon).values({
      id: platoonId,
      name: "פלוגת הצייד",
      codeName: "צייד-אלפא",
      description: "יחידת לחימה — דמו",
      createdAt: now,
    });

    await db.insert(team).values([
      {
        id: teamAlphaId,
        name: "כיתה א׳",
        teamNumber: "101",
        description: "כיתת סער",
        platoonId,
        createdAt: now,
      },
      {
        id: teamBravoId,
        name: "כיתה ב׳",
        teamNumber: "102",
        description: "כיתת חוד",
        platoonId,
        createdAt: now,
      },
    ]);

    await db.insert(users).values([
      {
        id: adminUserId,
        name: "מנהל מערכת",
        email: "admin@demo.local",
        password: passwordHash,
        role: UserRole.ADMIN,
        createdAt: now,
      },
      {
        id: cmdUserId,
        name: "מפקד כיתה",
        email: "commander@demo.local",
        password: passwordHash,
        role: UserRole.COMMANDER,
        createdAt: now,
      },
    ]);

    await db.insert(userPlatoonMembership).values([
      {
        id: randomUUID(),
        userId: adminUserId,
        platoonId,
        platoonRole: "ADMIN",
        createdAt: now,
      },
      {
        id: randomUUID(),
        userId: cmdUserId,
        platoonId,
        platoonRole: "MANAGER",
        createdAt: now,
      },
    ]);

    await db.insert(userTeamMembership).values([
      {
        id: randomUUID(),
        userId: cmdUserId,
        teamId: teamAlphaId,
        teamRole: "MANAGER",
        createdAt: now,
      },
      {
        id: randomUUID(),
        userId: adminUserId,
        teamId: teamAlphaId,
        teamRole: "VIEWER",
        createdAt: now,
      },
    ]);

    const fighter1Id = randomUUID();
    const fighter2Id = randomUUID();
    const fighter3Id = randomUUID();

    console.log("Inserting fighters…");

    await db.insert(fighter).values([
      {
        id: fighter1Id,
        firstName: "יוסי",
        lastName: "כהן",
        personalNumber: "12345678",
        idNumber: "123456782",
        email: "yossi@example.local",
        phoneNumber: "0501234567",
        shirtSize: "M",
        pantsSize: "48",
        shoesSize: 42,
        professional: "קלע",
        teamId: teamAlphaId,
        ironNumber: "1",
        class: "א",
        kit: "מלא",
        createdAt: now,
      },
      {
        id: fighter2Id,
        firstName: "דני",
        lastName: "לוי",
        personalNumber: "23456789",
        idNumber: "234567893",
        phoneNumber: "0509876543",
        shirtSize: "L",
        professional: "חובש",
        teamId: teamAlphaId,
        ironNumber: "2",
        class: "א",
        createdAt: now,
      },
      {
        id: fighter3Id,
        firstName: "רועי",
        lastName: "מזרחי",
        personalNumber: "34567890",
        idNumber: "345678904",
        shirtSize: "M",
        professional: "קשר",
        teamId: teamBravoId,
        ironNumber: "1",
        class: "ב",
        createdAt: now,
      },
    ]);

    const workDate = new Date().toISOString().slice(0, 10);

    console.log("Inserting attendance…");

    await db.insert(attendance).values([
      {
        id: randomUUID(),
        fighterId: fighter1Id,
        location: "נוכח",
        workDate,
        notes: "דמו — נוכחות רגילה",
        createdAt: now,
      },
      {
        id: randomUUID(),
        fighterId: fighter2Id,
        location: "יוצא",
        workDate,
        notes: "יציאה לתרגיל",
        createdAt: now,
      },
      {
        id: randomUUID(),
        fighterId: fighter3Id,
        location: "בבית",
        workDate,
        createdAt: now,
      },
    ]);

    const gearRadioId = randomUUID();
    const gearRifleId = randomUUID();

    console.log("Inserting serialized gear…");

    await db.insert(serializedGear).values([
      {
        id: gearRadioId,
        name: "מכשיר קשר 152",
        type: "קשר",
        createdAt: now,
      },
      {
        id: gearRifleId,
        name: "רובה M4",
        type: "נשק",
        createdAt: now,
      },
    ]);

    const assign1 = randomUUID();
    const assign2 = randomUUID();

    await db.insert(serializedGearFighter).values([
      {
        id: assign1,
        serializedGearId: gearRadioId,
        fighterId: fighter1Id,
        fightersTeamId: teamAlphaId,
        serialNumber: "KR-1001",
        issuedDate: workDate,
        location: "ארון כיתה א׳",
        createdAt: now,
      },
      {
        id: assign2,
        serializedGearId: gearRifleId,
        fighterId: fighter2Id,
        fightersTeamId: teamAlphaId,
        serialNumber: "WP-7721",
        issuedDate: workDate,
        createdAt: now,
      },
    ]);

    await db.insert(serializedGearCheck).values({
      id: randomUUID(),
      serializedGearFighterId: assign1,
      date: workDate,
      isCheck: true,
      createdAt: now,
    });

    console.log("Inserting logistic gear…");

    await db.insert(logisticGear).values([
      {
        id: randomUUID(),
        name: "קלסרים",
        description: "ציוד לוגיסטי — דמו",
        quantity: 40,
        location: "מחסן כיתה א׳",
        teamId: teamAlphaId,
        timeOfIssue: workDate,
        createdAt: now,
      },
      {
        id: randomUUID(),
        name: "מים שתייה",
        quantity: 120,
        location: "מחסן כיתה ב׳",
        teamId: teamBravoId,
        createdAt: now,
      },
    ]);

    console.log("Done.");
    console.log(`Demo login (Credentials): admin@demo.local / ${DEMO_PASSWORD}`);
    console.log(`Demo login (Credentials): commander@demo.local / ${DEMO_PASSWORD}`);
    console.log("Ensure you ran: pnpm db:migrate:local");
  } finally {
    await dispose();
  }
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
