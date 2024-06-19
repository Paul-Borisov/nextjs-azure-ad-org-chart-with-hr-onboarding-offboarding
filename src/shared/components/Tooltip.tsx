import { ReactNode } from "react";
import { Tooltip as RadixTooltip } from "@radix-ui/themes";

export const Tooltip = ({
  children,
  content,
}: {
  children: ReactNode;
  content: string;
}) => {
  return (
    <RadixTooltip content={content} className="!z-20">
      {children}
    </RadixTooltip>
  );
};

export default Tooltip;
