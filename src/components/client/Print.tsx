import Svg, { SvgType } from "@/shared/images/Svg";
import { Theme } from "@radix-ui/themes";
import { Tooltip } from "@/shared/components/Tooltip";
import { useTranslation } from "react-i18next";
import Utils from "@/shared/lib/utils";

const Print = () => {
  const { t } = useTranslation();
  const isDarkMode = Utils.isDarkMode();

  return (
    <Theme appearance={isDarkMode ? "dark" : "light"}>
      <Tooltip content={t("print")}>
        <div
          className="cursor-pointer mr-3 w-[32px] h-[32px]"
          aria-label={t("print")}
          onClick={() => window.print()}
        >
          {Svg[SvgType.print]}
        </div>
      </Tooltip>
    </Theme>
  );
};

export default Print;
