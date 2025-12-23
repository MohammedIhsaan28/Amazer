import Link from "next/link";
import Maxwidthwrapper from "./Maxwidthwrapper";
import { buttonVariants } from "./ui/button";
import { getKindeServerSession, LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/server";
import { ArrowRight } from "lucide-react";
import UserAccountNav from "./UserAccountNav";
import { Icon } from "./icons";
import MobileNav from "./MobileNav";

export default async function Navbar() {
  const {getUser} = getKindeServerSession()
  const user = await getUser();
  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <Maxwidthwrapper>
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="flex z-40 font-semibold">
            <Icon.logo className="w-6 h-6 "/>
            <span>Amaze</span>
          </Link>
          <MobileNav isAuth={!!user} />

          <div className="hidden items-center gap-4 sm:flex">
            {!user ? (
              <>
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
              Get Started{' '} <ArrowRight className="h-5 w-5" />
            </RegisterLink>
                </>
            ): (
              <>
              <Link href='/dashboard' className={buttonVariants({
                variant: 'ghost',
                size: 'sm',
                className:'bg-cyan-300'
              })}>
                Dashboard
              </Link>
              <UserAccountNav name={
                !user.given_name || !user.family_name
                ? 'Your Account'
                :`${user.given_name} ${user.family_name}`
              }
              email={user.email ?? ''}
              imageUrl={user.picture ?? ''}
               />
              </>
            )}
            
            

            
          </div>
        </div>
      </Maxwidthwrapper>
    </nav>
  );
}
