import Maxwidthwrapper from "@/components/Maxwidthwrapper";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
export default function Home() {
  return (
    <div>
      <Maxwidthwrapper className="mb-12 mt-28 sm:mt-40 flex flex-col items-center justify-center">
        <div className="mx-auto mb-4 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-gray-200 bg-white px-7 py-2 shadow-md backdrop-blur transition-all hover:border-gray-300 hover:bg-white/50">
          <p className="text-sm font-semibold text-gray-700">
            Amaze is now public!
          </p>
        </div>
        <div className="flex flex-col justify-center items-center">
          <h1 className=" text-center max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
            Chat with your <span className="text-blue-600">documents</span> in
            seconds
          </h1>
          <p className="text-center mt-5 max-w-prose text-zinc-700 sm:text-lg">
            Amaze allows you to have conversations with any PDF document. Simply
            upload you file and start asking questions right away
          </p>
          <Link
            className={`${buttonVariants({
              size: "lg",
              className: "mt-5",
            })} bg-black text-white`}
            href="/dashboard"
          >
            Get Started <ArrowRight className="ml-2 h-5 w-5" />{" "}
          </Link>
        </div>
      </Maxwidthwrapper>

      <div>
        <div className="relative isolate">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6, 97.5% 26.9%, 85.5% 0.1%, 88.7% 2%,72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%,0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem ] -translate-x-1/2 
                    rotate-30 bg-linear-to-br from-cyan-100 via-cyan-200 to-cyan-500 opacity-30 sm:left[calc(50%+36rem)]
                    sm:w-288.75"
            />
          </div>

          <div>
            <div className="mx-auto max-w-6xl px-6 lg:px-8">
              <div className="mt-16 flow-root sm:mt-24">
                <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                  <Image
                    src="/dashboard-preview.png"
                    alt="product-preview"
                    width={1364}
                    height={866}
                    quality={70}
                    className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10
            transform-gpu overflow-hidden blur-3xl "
          >
            <div
              style={{
                clipPath:
                  "polygon(74.1% 44.1%, 100% 61.6, 97.5% 26.9%, 85.5% 0.1%, 88.7% 2%,72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%,0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
              }}
              className="relative left-[calc(50%+3rem)] aspect-1155/678 w-[36.125rem ] -translate-x-1/2 
                    rotate-30 bg-linear-to-br from-emerald-500 via-teal-500 to-cyan-500 opacity-30 sm:left[calc(50%+36rem)]
                    sm:w-288.75"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto mb-32 mt-32 max-w-5xl sm:mt-56">
        <div className="mb-12 px-6 lg:px-8">
          <div className="mx-auto max-w-2xl sm:text-center">
            <h2 className="mt-2 font-bold text-4xl text-gray-900 sm:text-5xl">
              Start chatting in minutes
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Chatting to your PDF files has never been easier than with Amaze
            </p>
          </div>
        </div>
        <ol className="my-8 space-y-4 pt-8 md:flex md:space-x-12 md:space-y-8">
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2  md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-cyan-600">Step 1</span>
              <span className="text-xl font-semibold">
                Sign up for an account
              </span>
              <span className="mt-2 text-zinc-700">
                {" "}
                Start with the basic plan, just for the demo purpose!{" "}
                <Link
                  href="#/pricing"
                  className="text-cyan-700 underline underline-offset-2"
                >
                  Get Start!
                </Link>
              </span>
            </div>
          </li>

          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-cyan-600">Step 2</span>
              <span className="text-xl font-semibold">
                Upload your PDF file{" "}
              </span>
              <span className="mt-2 text-zinc-700">
                {" "}
                We&apos;ll process your file and make it you to chat with
              </span>
            </div>
          </li>

          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-cyan-600">Step 3</span>
              <span className="text-xl font-semibold">
                Start asking questions{" "}
              </span>
              <span className="mt-2 text-zinc-700">
                {" "}
                It&apos;s that simple. Try out Amaze today - it really takes
                less than a minute
              </span>
            </div>
          </li>
        </ol>

        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mt-16 flow-root sm:mt-24">
            <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
              <Image
                src="/file-upload-preview.jpg"
                alt="uploading preview"
                width={1419}
                height={732}
                quality={70}
                className="rounded-md bg-white p-2 sm:p-8 md:p-20 shadow-2xl ring-1 ring-gray-900/10"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
