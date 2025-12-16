import Link from "next/link";
import Maxwidthwrapper from "./Maxwidthwrapper";
import { buttonVariants } from "./ui/button";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <Maxwidthwrapper>
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex z-40 font-semibold">
            <span>Amaze</span>
          </Link>

          <div className="hidden items-center gap-4 sm:flex">
            <Link
              href="/pricing"
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              Pricing
            </Link>
            <LoginLink
              className={buttonVariants({
                variant: "ghost",
                size: "sm",
              })}
            >
              Sign in
            </LoginLink>

            <RegisterLink
              className={buttonVariants({
                size: "sm",
                className: "bg-cyan-600 text-white hover:bg-cyan-700",
              })}
            >
              Get Started <ArrowRight className="h-5 w-5" />
            </RegisterLink>
          </div>
        </div>
      </Maxwidthwrapper>
    </nav>
  );
}
