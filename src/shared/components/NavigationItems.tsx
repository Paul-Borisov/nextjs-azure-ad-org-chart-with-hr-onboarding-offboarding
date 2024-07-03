import { ITranslationResource } from "@/shared/interfaces/iTranslationResource";
import Svg, { SvgType } from "../images/Svg";

export const getNavigationItems = (translations: ITranslationResource) => [
  {
    key: translations("headerEmployeeHierarchy"),
    url: "/",
    icon: Svg[SvgType.user],
  },
  {
    key: translations("headerOrganizationalStructure"),
    url: "/structure",
    icon: Svg[SvgType.structure],
  },
];
