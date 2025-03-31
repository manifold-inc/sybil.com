export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={"dark:bg-zinc-600 animate-pulse bg-mf-ash-300 " + className}
      {...props}
    />
  );
}
