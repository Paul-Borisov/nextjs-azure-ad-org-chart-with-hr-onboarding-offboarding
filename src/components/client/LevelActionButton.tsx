import { Button } from "@radix-ui/themes";

export const LevelActionButton = (props: {
  onClick: () => void;
  title: string;
  disabled?: boolean;
}) => {
  return (
    <Button
      variant="outline"
      className="!cursor-pointer !w-44"
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.title}
    </Button>
  );
};
