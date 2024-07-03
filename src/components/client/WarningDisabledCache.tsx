"use client";

import { useTranslation } from "react-i18next";

const WarningDisabledCache = ({
  translationKey,
}: {
  translationKey: string;
}) => {
  const { t } = useTranslation();
  return (
    <span className="absolute z-50 top-0 left-7 text-[10px]">
      {t(translationKey)}
    </span>
  );
};

export default WarningDisabledCache;
