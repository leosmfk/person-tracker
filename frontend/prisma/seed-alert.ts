import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const person = await prisma.person.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!person) {
    console.log("Nenhuma pessoa encontrada. Crie uma pessoa primeiro.");
    process.exit(1);
  }

  const jobChange = await prisma.jobChange.create({
    data: {
      personId: person.id,
      previousRole: "Software Engineer",
      newRole: "Senior Software Engineer",
      previousCompany: "Empresa A",
      newCompany: "Empresa B",
    },
  });

  console.log(
    `JobChange criado para "${person.name}" (id: ${jobChange.id}) — alerta ativo.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
