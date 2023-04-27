import { Game } from "@prisma/client";
import prisma from "config/database";
import { faker } from "@faker-js/faker";

export function createGame(consoleId: number) {
  return prisma.game.create({
    data: generateGame(consoleId),
  });
}

export function createManyGames(consoleId: number) {
  return prisma.game.createMany({
    data: [
      generateGame(consoleId),
      generateGame(consoleId),
      generateGame(consoleId),
      generateGame(consoleId),
      generateGame(consoleId),
      generateGame(consoleId),
      generateGame(consoleId),
    ],
  });
}

export function findFirstGame(title: string) {
  return prisma.game.findFirst({
    where: { title },
  });
}

export function generateGame(consoleId: number) {
  return {
    consoleId,
    title: faker.helpers.unique(faker.name.firstName),
  };
}
