import { Svg, SvgType } from "../images/Svg";

export default function Loading({ text }: { text?: string }) {
  return (
    <div role="status" className="flex">
      {Svg[SvgType.loading]}
      {text && <span className="pl-2 text-nowrap">{text}</span>}
    </div>
  );
}
