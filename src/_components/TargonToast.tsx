import { ActionButton } from "@/_components/ActionButton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function TargonToast({
  text,
  buttonText,
  buttonLink,
  buttonOnClick,
}: {
  text: string;
  buttonText?: string;
  buttonLink?: string;
  buttonOnClick?: () => void;
}) {
  const router = useRouter();

  const handleButtonClick = () => {
    if (buttonOnClick) {
      buttonOnClick();
    } else if (buttonLink) {
      router.push(buttonLink);
    }
  };

  return (
    <div className="relative flex w-full items-center gap-2">
      <Image
        src="/sybil-bg.svg"
        alt="Sybil"
        className="h-6 w-6"
        width={24}
        height={24}
        priority
      />
      <div className="flex w-full items-center gap-4">
        <p className="flex-1">{text}</p>
        {buttonText && (
          <ActionButton
            width="sm"
            height="md"
            onClick={handleButtonClick}
            buttonText={buttonText}
          />
        )}
      </div>
    </div>
  );
}

export function showTargonToast(
  text: string,
  buttonText?: string,
  buttonLink?: string,
  buttonOnClick?: () => void
) {
  return toast(
    <TargonToast
      text={text}
      buttonText={buttonText}
      buttonLink={buttonLink}
      buttonOnClick={buttonOnClick}
    />,
    {
      style: {
        background: "#15161B",
        color: "#E7E6E7",
        border: "0px",
        borderRadius: "0.25rem",
      },
    }
  );
}
