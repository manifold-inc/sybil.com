"use client";

import { useState } from "react";
import Image from "next/image";
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
  "border-1 flex disabled:text-gray-600 dark:disabled:text-gray-300 bg-mf-ash-500 w-full items-center justify-center gap-3 whitespace-nowrap rounded-full px-4 py-2 outline-none placeholder: invalid:border-red-500 focus:border-black dark:focus:border-white";
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
    <div className="relative flex p-8">
      <div className="absolute left-0 hidden sm:block">
        <Link className="flex items-center gap-2 pl-12" href="/">
          <Image src="/sybil-bg.svg" alt="Sybil" width={16} height={16} />
          <span className="text-xl font-semibold text-mf-milk-300">SYBIL</span>
        </Link>
      </div>
      <div className="flex h-[80vh] w-full items-center justify-center">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex w-72 max-w-sm flex-col gap-10">
            <div className="text-center text-3xl font-semibold">Sign Up</div>
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
                  className="text-gray-500 dark:text-gray-400 absolute bottom-0 right-3 top-0"
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
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={createAccouint.isLoading}
                className="hover:bg-mf-green-800 flex items-center gap-2 whitespace-nowrap rounded-full bg-mf-green-700 px-4 py-1 font-semibold text-mf-ash-700 hover:bg-mf-green-700/80"
              >
                Create Account
                {createAccouint.isLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
