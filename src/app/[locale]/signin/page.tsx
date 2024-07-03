"use client";

import { useTranslation } from "react-i18next";

function DefaultPage() {
  const { t } = useTranslation();

  if (!/error=/i.test(window.location.search)) {
    window.location.href = "/";
  } else {
    return (
      <div className="absolute bold top-20 left-3">
        {`${t("authenticationError")}: ${decodeURIComponent(
          window.location.search.replace(/^.+error=/i, "")
        )}`}
      </div>
    );
  }
}

export default DefaultPage;
