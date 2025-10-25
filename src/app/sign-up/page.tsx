"use client";

import { ActionButton } from "@/_components/ActionButton";
import { useAuth } from "@/_components/providers";
import { showTargonToast } from "@/_components/TargonToast";
import { api } from "@/trpc/react";
import clsx from "clsx";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { type SubmitHandler, useForm } from "react-hook-form";

type Inputs = {
  name: string;
  email: string;
  password: string;
  password2: string;
};
const errorStyle = "text-xs text-mf-safety-500 pl-4";
const baseStyles =
  "border-1 flex bg-mf-new-700 focus:bg-mf-new-700 w-full items-center justify-center gap-3 whitespace-nowrap rounded-full px-4 py-2 outline-none invalid:border-mf-safety-500 focus:border-black focus:border-mf-ash-500";

export default function Page() {
  const [visible, setVisible] = useState(false);
  const { refetch } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Inputs>();
  const createAccount = api.account.createAccount.useMutation({
    onError: (e) => {
      showTargonToast(e.message || "Failed to create account");
    },
    onSuccess: async () => {
      await refetch();
      router.push("/");
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (createAccount.isLoading) return;
    createAccount.mutate(data);
  };
  return (
    <div className="relative flex p-8">
      <div className="flex h-[80vh] w-full items-center justify-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex w-72 max-w-sm flex-col gap-4">
            <div className="flex flex-col gap-4 items-center justify-center text-center text-3xl pb-6">
              <Image src="/sybil.svg" alt="Logo" width={32} height={32} />
              Join Sybil
            </div>
            <div>
              <input
                disabled={createAccount.isLoading}
                {...register("name", { required: false })}
                placeholder="Enter Name..."
                type="text"
                className={clsx(baseStyles, {
                  "border-mf-safety-500": errors.name,
                  "border-mf-new-500": !errors.name,
                })}
              />
              <span className={errorStyle}>{errors.email?.message}</span>
            </div>
            <div>
              <input
                disabled={createAccount.isLoading}
                {...register("email", {
                  required: "Email address is required",
                  validate: (v) => v.includes("@") && v.includes("."),
                })}
                placeholder="Enter Email..."
                type="email"
                className={clsx(baseStyles, {
                  "border-mf-safety-500": errors.email,
                  "border-mf-new-500": !errors.email,
                })}
              />
              <span className={errorStyle}>{errors.email?.message}</span>
            </div>
            <div>
              <div className="relative">
                <input
                  {...register("password", {
                    required: "Password is Required",
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 Characters",
                    },
                  })}
                  disabled={createAccount.isLoading}
                  placeholder="Enter Password..."
                  type={visible ? "text" : "password"}
                  className={clsx(baseStyles, {
                    "border-mf-safety-500": errors.password,
                    "border-mf-new-500": !errors.password,
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
                  className="absolute top-0 right-3 bottom-0"
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
            <div>
              <div className="relative">
                <input
                  {...register("password2", {
                    required: "Passwords must match",
                    minLength: {
                      value: 8,
                      message: "Password must be atleast 8 Characters",
                    },
                    validate: (v) =>
                      v === getValues("password")
                        ? true
                        : "Passwords must match",
                  })}
                  type={visible ? "text" : "password"}
                  disabled={createAccount.isLoading}
                  placeholder="Retype Password..."
                  className={clsx(baseStyles, {
                    "border-mf-safety-500": errors.password2,
                    "border-mf-new-500": !errors.password2,
                  })}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setVisible((s) => !s);
                  }}
                  className="absolute top-0 right-3 bottom-0"
                >
                  {visible ? (
                    <Eye className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </button>
              </div>
              <span className={errorStyle}>{errors.password2?.message}</span>
            </div>
            <div className="flex justify-center gap-2">
              <ActionButton
                tag="link"
                href="/sign-in"
                buttonText="Log In"
                variant="noir"
                width="md"
                height="md"
                className="!text-mf-green-500"
              />
              <ActionButton
                tag="button"
                buttonText="Create Account"
                width="md"
                height="md"
                disabled={createAccount.isLoading}
                icon={
                  createAccount.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : undefined
                }
                onClick={handleSubmit(onSubmit)}
              />
            </div>
            <div className="relative">
              <div className="relative flex justify-center">
                <span className="px-2 text-xs">Or Continue with</span>
              </div>
            </div>
            <div className="flex justify-center">
              <ActionButton
                tag="link"
                href="/sign-in/google"
                buttonText="Google"
                width="md"
                height="lg"
                className="!bg-white !text-mf-ash-700 !border-white !gap-2"
                icon={
                  <svg
                    className="h-4 w-4"
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                  >
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
                }
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
