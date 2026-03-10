import prisma from "./src/infrastructure/db/prisma";

console.log("Prisma Models:", Object.keys(prisma).filter(k => !k.startsWith("_") && !k.startsWith("$")));
