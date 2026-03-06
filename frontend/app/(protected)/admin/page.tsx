"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
}

export default function AdminPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isAdmin = session?.user && "role" in session.user && session.user.role === "admin";

  useEffect(() => {
    if (isPending) return;
    if (!isAdmin) {
      router.push("/home");
      return;
    }
    loadUsers();
  }, [isPending, isAdmin]);

  async function loadUsers() {
    setLoading(true);
    const { data } = await authClient.admin.listUsers({
      limit: 100,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    if (data) {
      setUsers(data.users as User[]);
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCreating(true);

    const { error: createError } = await authClient.admin.createUser({
      name,
      email,
      password,
      role,
    });

    if (createError) {
      setError(createError.message ?? "Erro ao criar usuario");
    } else {
      setSuccess(`Usuario ${email} criado com sucesso`);
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      loadUsers();
    }
    setCreating(false);
  }

  if (isPending || !isAdmin) {
    return null;
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          Gerenciar Usuarios
        </h1>
        <p className="text-muted-foreground">
          Crie e gerencie os usuarios do sistema.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">Criar novo usuario</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Combobox
                items={["User", "Admin"]}
                value={role === "admin" ? "Admin" : "User"}
                onValueChange={(val) => val && setRole(val.toLowerCase())}
              >
                <ComboboxInput placeholder="Selecione o role" className="w-full" />
                <ComboboxContent>
                  <ComboboxEmpty>Nenhum resultado.</ComboboxEmpty>
                  <ComboboxList>
                    {(item) => (
                      <ComboboxItem key={item} value={item}>
                        {item}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>

            {error && <p className="text-destructive text-sm">{error}</p>}
            {success && <p className="text-sm text-green-600">{success}</p>}

            <Button type="submit" className="mt-2 w-full" disabled={creating}>
              {creating ? "Criando..." : "Criar Usuario"}
            </Button>
          </form>
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="mb-4 text-lg font-semibold">Usuarios cadastrados</h2>
          {loading ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.banned ? (
                        <Badge variant="destructive">Banido</Badge>
                      ) : (
                        <Badge variant="outline">Ativo</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
}
