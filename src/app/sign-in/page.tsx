"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

import { reactClient } from "@/trpc/react";
import { useAuth } from "../_components/providers";

type Inputs = {
  email: string;
  password: string;
};
const errorStyle = "text-xs text-red-500";
const baseStyles =
  "border-1 flex disabled:text-gray-600 dark:disabled:text-gray-300  bg-transparent w-full items-center justify-center gap-3 whitespace-nowrap rounded-md border px-2 py-2 outline-none placeholder: invalid:border-red-500 focus:border-black dark:focus:border-white";
export default function Page() {
  const router = useRouter();
  const [visable, setVisable] = useState(false);
  const { refetch } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>();
  const signIn = reactClient.account.signIn.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: () => {
      refetch();
      router.push("/");
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (signIn.isLoading) return;
    signIn.mutate(data);
  };
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-full max-w-sm flex-col gap-4">
          <div className="text-center text-3xl font-extrabold">Sign In</div>
          <Link
            href="/sign-in/google"
            className="border-1 border-gray-400 dark:bg-black dark:active:border-white flex w-full items-center justify-center gap-3 whitespace-nowrap rounded-md border py-2"
          >
            <svg viewBox="0 0 128 128" className="h-5 w-5">
              <path
                fill="#fff"
                d="M44.59 4.21a63.28 63.28 0 004.33 120.9 67.6 67.6 0 0032.36.35 57.13 57.13 0 0025.9-13.46 57.44 57.44 0 0016-26.26 74.33 74.33 0 001.61-33.58H65.27v24.69h34.47a29.72 29.72 0 01-12.66 19.52 36.16 36.16 0 01-13.93 5.5 41.29 41.29 0 01-15.1 0A37.16 37.16 0 0144 95.74a39.3 39.3 0 01-14.5-19.42 38.31 38.31 0 010-24.63 39.25 39.25 0 019.18-14.91A37.17 37.17 0 0176.13 27a34.28 34.28 0 0113.64 8q5.83-5.8 11.64-11.63c2-2.09 4.18-4.08 6.15-6.22A61.22 61.22 0 0087.2 4.59a64 64 0 00-42.61-.38z"
              ></path>
              <path
                fill="#e33629"
                d="M44.59 4.21a64 64 0 0142.61.37 61.22 61.22 0 0120.35 12.62c-2 2.14-4.11 4.14-6.15 6.22Q95.58 29.23 89.77 35a34.28 34.28 0 00-13.64-8 37.17 37.17 0 00-37.46 9.74 39.25 39.25 0 00-9.18 14.91L8.76 35.6A63.53 63.53 0 0144.59 4.21z"
              ></path>
              <path
                fill="#f8bd00"
                d="M3.26 51.5a62.93 62.93 0 015.5-15.9l20.73 16.09a38.31 38.31 0 000 24.63q-10.36 8-20.73 16.08a63.33 63.33 0 01-5.5-40.9z"
              ></path>
              <path
                fill="#587dbd"
                d="M65.27 52.15h59.52a74.33 74.33 0 01-1.61 33.58 57.44 57.44 0 01-16 26.26c-6.69-5.22-13.41-10.4-20.1-15.62a29.72 29.72 0 0012.66-19.54H65.27c-.01-8.22 0-16.45 0-24.68z"
              ></path>
              <path
                fill="#319f43"
                d="M8.75 92.4q10.37-8 20.73-16.08A39.3 39.3 0 0044 95.74a37.16 37.16 0 0014.08 6.08 41.29 41.29 0 0015.1 0 36.16 36.16 0 0013.93-5.5c6.69 5.22 13.41 10.4 20.1 15.62a57.13 57.13 0 01-25.9 13.47 67.6 67.6 0 01-32.36-.35 63 63 0 01-23-11.59A63.73 63.73 0 018.75 92.4z"
              ></path>
            </svg>
            Sign in with Google
          </Link>
          <div className="relative">
            <div
              className="absolute inset-0 flex items-center"
              aria-hidden="true"
            >
              <div className="border-gray-300 w-full border-t" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white text-gray-500  px-2 dark:bg-sgray-800">
                or
              </span>
            </div>
          </div>
          <div>
            <input
              disabled={signIn.isLoading}
              {...register("email", {
                required: "Email address is required",
                validate: (v) => v.includes("@") && v.includes("."),
              })}
              type="email"
              placeholder="Email Address"
              className={clsx(baseStyles, {
                "border-red-500": errors.email,
                "border-gray-400": !errors.email,
              })}
            />
            <span className={errorStyle}>{errors.email?.message}</span>
          </div>
          <div>
            <div className="relative">
              <input
                {...register("password", {
                  required: "Password is Required",
                })}
                disabled={signIn.isLoading}
                placeholder="Password"
                type={visable ? "text" : "password"}
                className={clsx(baseStyles, {
                  "border-red-500": errors.password,
                  "border-gray-400": !errors.password,
                })}
              />
              <button
                tabIndex={-1}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setVisable((s) => !s);
                }}
                className="text-gray-500 dark:text-gray-400 absolute bottom-0 right-3 top-0"
              >
                {visable ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
            <span className={errorStyle}>{errors.password?.message}</span>
          </div>
          <div>
            <button
              type="submit"
              disabled={signIn.isLoading}
              className="border-1 border-gray-400 hover:bg-gray-100 focus:border-white dark:bg-black dark:hover:bg-neutral-700 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border px-2 py-2 outline-none transition-colors disabled:opacity-60"
            >
              {signIn.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </button>
            <div className="text-gray-500 dark:text-gray-400  pt-1 text-center">
              or{" "}
              <Link className="underline" href="/create-account">
                create an account
              </Link>
            </div>
          </div>
          <div className="text-gray-500 dark:text-gray-400 text-balance  pt-2 text-center">
            By signing up, you agree to the{" "}
            <Link href="/terms-of-service" className="underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="underline">
              Privacy Policy
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
