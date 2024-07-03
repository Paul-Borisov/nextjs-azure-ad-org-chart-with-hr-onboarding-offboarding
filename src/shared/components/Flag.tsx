import Image from "next/image";
import { Svg } from "../images/Svg";

function Flag({
  locale,
  width = 32,
  height = 21,
}: {
  locale: string;
  width?: number;
  height?: number;
}) {
  const flag = Svg[locale.toLocaleLowerCase()];

  return flag ? (
    <div
      className="cursor-pointer mr-3"
      aria-label={locale}
      style={{ width: width, height: height }}
    >
      {flag}
    </div>
  ) : (
    <Image
      className="cursor-pointer mr-3"
      // https://www.npmjs.com/package/country-flag-icons
      src={`http://purecatamphetamine.github.io/country-flag-icons/3x2/${locale.toUpperCase()}.svg`}
      width={width}
      height={height}
      alt={locale}
    />
  );
}

export default Flag;
