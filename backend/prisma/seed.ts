import { PrismaClient } from "@prisma/client";
const prismaClient = new PrismaClient();

async function main() {
  await prismaClient.availableTriggers.create({
    data: {
      id: "webhook",
      name: "Webbhook",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSl05fkQtyjsAp8-WQh5AxYp8tKCHlQJ7rHCw&s",
    },
  });

  await prismaClient.availableAction.create({
    data: {
      id: "send-sol",
      name: "Solana",
      image: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
    },
  });

  await prismaClient.availableAction.create({
    data: {
      id: "email",
      name: "Email",
      image:
        "https://media.istockphoto.com/id/826567080/vector/e-mail-icon-simple-vector-illustration-red-color.jpg?s=612x612&w=0&k=20&c=ysxmzarWz_6a2oyi1ue9p6OUBXAw8W1LQPsyorc_5hY=",
    },
  });
}

main();
