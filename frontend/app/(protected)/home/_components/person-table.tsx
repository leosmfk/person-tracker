"use client";

import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import { AddPersonDialog } from "./add-person-dialog";
import { DataTable } from "./data-table";
import { getColumns, type PersonRow } from "./columns";

interface PersonTableProps {
  data: PersonRow[];
}

export function PersonTable({ data }: PersonTableProps) {
  const columns = getColumns();
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <Input
          placeholder="Buscar pessoa..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
        <AddPersonDialog />
      </div>

      <DataTable table={table} />
    </>
  );
}
