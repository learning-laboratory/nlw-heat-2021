import { io } from "../app";
import prismaClient from "../prisma";

class FetchMessageService {
  async execute(limit: number = 3) {
    const messages = await prismaClient.message.findMany({
      take: limit,
      orderBy: { created_at: "desc" },
      include: {
        user: true,
      },
    });
    return messages;
  }
}

export { FetchMessageService };
