"use client";

import { useAuth } from "@/_components/providers";
import { reactClient } from "@/trpc/react";
import clsx from "clsx";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

type Inputs = {
  email: string;
  password: string;
};
const errorStyle = "text-xs text-red-500";
const baseStyles =
  "border-1 flex disabled:text-gray-600 dark:disabled:text-gray-300 bg-mf-ash-500 w-full items-center justify-center gap-3 whitespace-nowrap rounded-full px-4 py-2 outline-none placeholder: invalid:border-red-500 focus:border-black dark:focus:border-white";
export default function Page() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
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
    <div className="relative flex p-8">
      <div className="absolute left-0 hidden sm:block">
        <Link className="flex items-center gap-2 pl-12" href="/">
          <Image src="/sybil-bg.svg" alt="Sybil" width={16} height={16} />
          <span className="text-mf-milk-300 text-xl font-semibold">SYBIL</span>
        </Link>
      </div>
      <div className="flex h-[80vh] w-full items-center justify-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex w-72 max-w-sm flex-col gap-10">
            <div className="text-center text-3xl font-semibold">
              WELCOME BACK
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
                  type={visible ? "text" : "password"}
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
                    setVisible((s) => !s);
                  }}
                  className="absolute top-0 right-3 bottom-0 text-gray-500 dark:text-gray-400"
                >
                  {visible ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
              <span className={errorStyle}>{errors.password?.message}</span>
            </div>
            <div className="flex justify-center gap-2">
              <Link
                className="text-mf-green-500 hover:bg-mf-green-500/10 rounded-full px-4 py-1 font-semibold whitespace-nowrap"
                href="/sign-up"
              >
                Sign up
              </Link>
              <button
                type="submit"
                disabled={signIn.isLoading}
                className="hover:bg-mf-green-800 bg-mf-green-500 text-mf-ash-700 hover:bg-mf-green-500/80 flex items-center gap-2 rounded-full px-4 py-1 font-semibold whitespace-nowrap"
              >
                Log In
                {signIn.isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </button>
            </div>
            <div className="relative">
              <div className="relative flex justify-center">
                <span className="px-2 text-sm text-gray-500">
                  Or Continue with
                </span>
              </div>
            </div>
            <div className="flex justify-center">
              <Link
                href={`/sign-in/google`}
                className="flex h-9 w-32 items-center justify-center gap-3 rounded-full bg-[#FFFFFF] py-2 whitespace-nowrap"
              >
                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                <span className="text-mf-ash-700 text-sm leading-6 font-semibold">
                  Google
                </span>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
