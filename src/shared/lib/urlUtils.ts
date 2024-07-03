export default class UrlUtils {
  static getCallbackUrlFromQueryString = (): string => {
    let callbackUrl = decodeURIComponent(
      window.location.search.replace(`?${"callbackUrl"}=`, "")
    );
    if (!callbackUrl.startsWith(window.location.origin)) {
      callbackUrl = `${window.location.origin}/${
        callbackUrl.startsWith("/") ? callbackUrl.replace(/^\//, "") : "" // Replace any external URLs for safety
      }`;
    }
    return callbackUrl;
  };
}
