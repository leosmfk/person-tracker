"use client";

import { ColumnDef } from "@tanstack/react-table";

export type PersonRow = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  linkedinUrl: string;
  hasAlert: boolean;
};

function formatPhone(phone: string): string {
  if (phone.length === 11) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 7)}-${phone.slice(7)}`;
  }
  if (phone.length === 10) {
    return `(${phone.slice(0, 2)}) ${phone.slice(2, 6)}-${phone.slice(6)}`;
  }
  if (phone.length === 13) {
    return `+${phone.slice(0, 2)} (${phone.slice(2, 4)}) ${phone.slice(4, 9)}-${phone.slice(9)}`;
  }
  return phone;
}

export function getColumns(): ColumnDef<PersonRow>[] {
  return [
    {
      accessorKey: "name",
      header: "Nome",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.hasAlert && (
            <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
              !
            </span>
          )}
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Telefone",
      cell: ({ row }) => {
        const phone = row.getValue("phone") as string | null;
        return phone ? formatPhone(phone) : "—";
      },
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => row.getValue("email") || "—",
    },
    {
      accessorKey: "linkedinUrl",
      header: "LinkedIn",
      cell: ({ row }) => (
        <a
          href={row.getValue("linkedinUrl")}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sky-600 hover:underline"
        >
          {row.getValue("linkedinUrl")}
        </a>
      ),
    },
  ];
}
