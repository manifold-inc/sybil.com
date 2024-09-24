export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={"animate-pulse bg-gray-200 dark:bg-zinc-600 " + className}
      {...props}
    />
  );
}
