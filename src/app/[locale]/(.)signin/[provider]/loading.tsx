"use client";
import { useTranslation } from "react-i18next";
import Loading from "@/shared/components/Loading";
import Utils from "@/shared/lib/utils";

export default function LoadingPage() {
  const { t } = useTranslation();
  const isDarkMode = Utils.isDarkMode();

  return (
    <div className="fixed inset-0 backdrop:bg-black/40 rounded-md outline-none">
      <div
        className={[
          "p-52 rounded-lg border",
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          isDarkMode ? "border-gray-800 bg-[#191919]" : undefined,
        ]
          .join(" ")
          .trim()}
      >
        <Loading text={`${t("loading")}...`} />
      </div>
    </div>
  );
}
