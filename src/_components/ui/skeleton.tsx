export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={
        "bg-mf-ash-300 z-10 animate-pulse dark:bg-zinc-600 " + className
      }
      {...props}
    />
  );
}
