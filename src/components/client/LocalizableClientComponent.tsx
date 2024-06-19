"use client";

import { useTranslation } from "react-i18next";

export default function LocalizableClientComponent() {
  const { t } = useTranslation();
  return <p>{t("subheader")}</p>;
}
