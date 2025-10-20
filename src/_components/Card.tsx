import Link from "next/link";

export const Card = ({
  children,
  link,
  className,
}: {
  children: React.ReactNode;
  link?: string;
  className?: string;
}) => {
  if (link) {
    return (
      <Link href={link}>
        <div
          className={`bg-mf-card-dark border-mf-metal-300 rounded-md border p-4 transition-colors hover:opacity-90 ${className} `}
        >
          {children}
        </div>
      </Link>
    );
  }
  return (
    <div
      className={`bg-mf-card-dark border-mf-metal-300 rounded-md border p-4 ${className} `}
    >
      {children}
    </div>
  );
};
