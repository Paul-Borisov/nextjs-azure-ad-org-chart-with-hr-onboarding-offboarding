import { ITranslationResource } from "./iTranslationResource";
import { TFunction } from "i18next";

export interface ILocalizableServer {
  translations: TFunction<["translation", ...string[]], undefined>;
}

export interface ILocalizableClient {
  translations: ITranslationResource;
}
