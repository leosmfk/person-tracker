import { prisma } from "@/lib/prisma";
import { PersonTable } from "./_components/person-table";

export default async function HomePage() {
  const people = await prisma.person.findMany({
    include: {
      jobChanges: {
        where: { dismissedAt: null },
        select: { id: true, detectedAt: true },
        orderBy: { detectedAt: "asc" },
        take: 1,
      },
    },
  });

  const data = people
    .map((p) => ({
      id: p.id,
      name: p.name,
      phone: p.phone,
      email: p.email,
      linkedinUrl: p.linkedinUrl,
      hasAlert: p.jobChanges.length > 0,
      oldestAlertAt: p.jobChanges[0]?.detectedAt ?? null,
      createdAt: p.createdAt,
    }))
    .sort((a, b) => {
      if (a.hasAlert !== b.hasAlert) return a.hasAlert ? -1 : 1;
      if (a.hasAlert && b.hasAlert) {
        return (a.oldestAlertAt!.getTime()) - (b.oldestAlertAt!.getTime());
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Bem-vindo de volta!
        </h1>
        <p className="text-muted-foreground">
          Aqui esta a lista das pessoas monitoradas.
        </p>
      </div>

      <PersonTable data={data} />
    </>
  );
}
