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
  password2: string;
};
const baseStyles =
  "border-1 flex disabled:text-gray-600 dark:disabled:text-gray-300 w-full items-center justify-center gap-3 whitespace-nowrap rounded-md border dark:bg-transparent px-2 py-2 outline-none placeholder:text-sm invalid:border-red-500 focus:border-black dark:focus:border-white";
const errorStyle = "text-xs text-red-500";

export default function Page() {
  const [visable, setVisable] = useState(false);
  const { refetch } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<Inputs>();
  const createAccouint = reactClient.account.createAccount.useMutation({
    onError: (e) => {
      toast.error(e.message);
    },
    onSuccess: () => {
      refetch();
      router.push("/");
    },
  });
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (createAccouint.isLoading) return;
    createAccouint.mutate(data);
  };
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex w-full max-w-sm flex-col gap-4">
          <div className="pb-2 text-center text-3xl font-extrabold">
            Sign Up
          </div>
          <div>
            <input
              disabled={createAccouint.isLoading}
              {...register("email", {
                required: "Email address is required",
                validate: (v) => v.includes("@") && v.includes("."),
              })}
              placeholder="Email Address"
              type="email"
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
                  minLength: {
                    value: 8,
                    message: "Password must be atleast 8 Characters",
                  },
                })}
                disabled={createAccouint.isLoading}
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
                className="absolute bottom-0 right-3 top-0 text-gray-500 dark:text-gray-400"
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
            <div className="relative">
              <input
                {...register("password2", {
                  required: "Passwords must match",
                  minLength: {
                    value: 8,
                    message: "Password must be atleast 8 Characters",
                  },
                  validate: (v) =>
                    v === getValues("password") ? true : "Passwords must match",
                })}
                type={visable ? "text" : "password"}
                disabled={createAccouint.isLoading}
                placeholder="Retype Password"
                className={clsx(baseStyles, {
                  "border-red-500": errors.password2,
                  "border-gray-400": !errors.password2,
                })}
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setVisable((s) => !s);
                }}
                className="absolute bottom-0 right-3 top-0 text-gray-500 dark:text-gray-400"
              >
                {visable ? (
                  <Eye className="h-5 w-5" />
                ) : (
                  <EyeOff className="h-5 w-5" />
                )}
              </button>
            </div>
            <span className={errorStyle}>{errors.password2?.message}</span>
          </div>
          <div>
            <button
              type="submit"
              disabled={createAccouint.isLoading}
              className="border-1 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-gray-400 px-2 py-2 outline-none transition-colors hover:bg-gray-100 focus:border-white disabled:opacity-60 dark:bg-black dark:hover:bg-black"
            >
              {createAccouint.isLoading && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Create Account
            </button>
          </div>
          <div className="text-balance pt-2 text-center text-sm text-gray-500 dark:text-gray-400">
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
