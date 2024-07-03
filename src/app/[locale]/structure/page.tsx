import ContentPanel from "@/components/server/ContentPanel";
import { ViewType } from "@/components/enums/viewType";

export default async function ContentPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  return (
    <ContentPanel
      headerKey="headerOrganizationalStructure"
      viewType={ViewType.Units}
      locale={locale}
    />
  );
}
