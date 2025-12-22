import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Icon } from "./icons";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "./ui/dropdown-menu";
import Link from "next/link";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { LogOut, LogOutIcon } from "lucide-react";

interface UserAccountProps {
  email: string | undefined;
  name: string;
  imageUrl: string;
}
export default function UserAccountNav({
  email,
  imageUrl,
  name,
}: UserAccountProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="overflow-visible">
        <Button className="rounded-full h-8 w-8 aspect-square bg-cyan-300">
          <Avatar className="relative w-8 h-8 ">
            {imageUrl ? (
              <div className="relative aspect-square h-full w-full">
                <Icon.user className="h-4 w-4 text-black" />
              </div>
            ) : (
              <AvatarFallback>
                <span className="sr-only">{name}</span>
                <Icon.user className="h-4 w-4 " />
              </AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="bg-white" align="end">
        <div className="flex items-center justify-center gap-2 p-2">
          <div className="flex flex-col space-y-0.5 leading-none">
            {name && <p className="font-medium text-sm text-black">{name}</p>}
            {email && (
              <p className="w-50 truncate text-xs text-zinc-700">{email}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link className="hover:text-green-600" href='/dashboard'>Dashboard</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
            
            <LogoutLink>
                <div className="flex flex-row gap-1 items-center justify-center hover:text-red-500">
                    <LogOut className="w-4 h-4 mt-1"/>
                    <span className="">Logout</span>
                </div>
                
            </LogoutLink>
        </DropdownMenuItem>

      </DropdownMenuContent>

      
      
    </DropdownMenu>
  );
}
