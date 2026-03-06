import Image from "next/image";
import { UserMenu } from "@/components/user-menu";

interface AppHeaderProps {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between px-10 py-4">
      <Image
        src="/logo-grpp.png"
        alt="GRPP Logo"
        width={141}
        height={76}
        className="h-10 w-auto invert dark:invert-0"
        priority
      />
      <UserMenu user={user} />
    </header>
  );
}
