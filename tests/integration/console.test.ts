import { Console } from "@prisma/client";
import httpStatus from "http-status";
import supertest from "supertest";
import app from "../../src/app";
import prisma from "../../src/config/database";

import {
  createConsole,
  findFirstConsole,
  generateConsole,
} from "../factories/console-factory";

const api = supertest(app);

beforeEach(async () => {
  await prisma.game.deleteMany({});
  await prisma.console.deleteMany({});
});

describe("GET /consoles", () => {
  it("should return all consoles", async () => {
    await createConsole();
    await createConsole();

    const result = await api.get("/consoles");
    const consoles = result.body as Console[];

    expect(consoles).toHaveLength(2);
    expect(consoles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
        }),
      ])
    );
  });

  it("should an empty array because no console are registered", async () => {
    const result = await api.get("/consoles");
    const consoles = result.body as Console[];

    expect(result.status).toBe(httpStatus.OK);
    expect(consoles).toHaveLength(0);
  });
});

describe("GET /consoles/:id", () => {
  it("should return a console by id", async () => {
    const createdConsole = await createConsole();

    const result = await api.get(`/consoles/${createdConsole.id}`);
    const console = result.body as Console;

    expect(result.status).toBe(httpStatus.OK);
    expect(console).toEqual({
      id: createdConsole.id,
      name: createdConsole.name,
    });
  });

  it("should return 404 for console not found", async () => {
    const result = await api.get(`/consoles/0`);
    expect(result.status).toBe(httpStatus.NOT_FOUND);
  });
});

describe("POST /consoles", () => {
  it("should create a console", async () => {
    const consoleBody = generateConsole();
    await api.post("/consoles").send(consoleBody);

    const persistedConsole = await findFirstConsole(consoleBody.name);

    expect(persistedConsole).toEqual({
      id: expect.any(Number),
      name: consoleBody.name,
    });
  });

  it("should return 422 when trying to create a console with data missing", async () => {
    const result = await api.post("/consoles").send({});
    expect(result.status).toBe(httpStatus.UNPROCESSABLE_ENTITY);
  });

  it("should return 409 when trying to create a console that already exists", async () => {
    const console = await createConsole();
    const result = await api.post("/consoles").send({ name: console.name });
    expect(result.status).toBe(httpStatus.CONFLICT);
  });
});
