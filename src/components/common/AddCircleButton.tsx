import { Plus } from "lucide-react";
import Button from "../ui/button/Button";

type AddCircleButtonProps = {
  onClick: () => void;
  ariaLabel: string;
  className?: string;
};

export default function AddCircleButton({
  onClick,
  ariaLabel,
  className = "",
}: AddCircleButtonProps) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className={`h-12 w-12 rounded-full p-0 ${className}`.trim()}
      aria-label={ariaLabel}
    >
      <Plus size={24} />
    </Button>
  );
}

