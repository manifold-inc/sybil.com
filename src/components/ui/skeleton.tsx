export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={"bg-gray-200 dark:bg-zinc-600 animate-pulse " + className}
      {...props}
    />
  );
}
