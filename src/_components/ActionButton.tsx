import Link from "next/link";
import React from "react";

export const ActionButton: React.FC<{
  icon?: React.ReactNode;
  buttonText: string;
  href?: string;
  onClick?: () => void;
  className?: string;
  variant?: "noir";
  width: "sm" | "md" | "lg" | "fit" | "full";
  height: "sm" | "md" | "lg";
  disabled?: boolean;
  tag?: "a" | "link" | "button";
  textSize?: "xs" | "sm" | "md" | "";
}> = ({
  icon,
  buttonText,
  href,
  onClick,
  className,
  variant,
  width,
  height,
  disabled,
  tag = "link",
  textSize = "",
}) => {
  const bgColor =
    variant === "noir"
      ? "bg-mf-new-800 border border-mf-new-500"
      : "border border-mf-green-500 bg-mf-green-500";
  const textColor =
    variant === "noir" ? "text-mf-silver-500" : "text-mf-night-500";

  let widthClass = "";
  switch (width) {
    case "sm":
      widthClass = "w-28";
      break;
    case "md":
      widthClass = "w-36";
      break;
    case "lg":
      widthClass = "w-48";
      break;
    case "fit":
      widthClass = "w-fit px-2";
      break;
    case "full":
      widthClass = "w-full";
      break;
    default:
      return null;
  }

  let heightClass = "";
  switch (height) {
    case "sm":
      heightClass = "h-7";
      break;
    case "md":
      heightClass = "h-8";
      break;
    case "lg":
      heightClass = "h-9";
      break;
    default:
      return null;
  }

  let textSizeClass = height === "sm" ? `text-xs` : `text-sm`;
  if (textSize !== "") {
    switch (textSize) {
      case "xs":
        textSizeClass = "text-xs";
        break;
      case "sm":
        textSizeClass = "text-sm";
        break;
      case "md":
        textSizeClass = "text-md";
        break;
      default:
        textSizeClass = "text-sm";
        break;
    }
  }

  const baseClasses = [
    "flex",
    widthClass,
    heightClass,
    textSizeClass,
    "font-semibold",
    "font-saira",
    "whitespace-nowrap",
    bgColor,
    "rounded-[4px]",
    "transition",
    "hover:opacity-80",
    "items-center",
    "justify-center",
    "gap-1",
    textColor,
    className,
    disabled
      ? "cursor-not-allowed opacity-50 pointer-events-none"
      : "cursor-pointer",
  ]
    .filter(Boolean)
    .join(" ");

  if (tag === "a" && href) {
    return (
      <a
        href={disabled ? "#" : href}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        className={baseClasses}
      >
        {icon}
        {buttonText}
      </a>
    );
  }

  if (href) {
    return (
      <Link
        href={disabled ? "#" : href}
        onClick={disabled ? (e) => e.preventDefault() : onClick}
        className={baseClasses}
      >
        {icon}
        {buttonText}
      </Link>
    );
  }

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={baseClasses}
    >
      {icon}
      {buttonText}
    </button>
  );
};
