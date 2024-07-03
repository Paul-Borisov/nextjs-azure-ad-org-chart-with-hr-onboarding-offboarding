export const searchTextId = "searchText";

export default class SearchUtils {
  // IDs for highlighted HTML elements
  static getSearchIdFromSearchText = (): string | undefined => {
    const text = this.getSearchText();
    let id = text
      ?.replace(/[^\w\s-:._]/g, "")
      .replace(/\s+/g, "-")
      .toLocaleLowerCase();
    // Ensure the ID starts with a letter
    id = id?.replace(/^[^A-Za-z]+/, "");
    return id;
  };

  static getSearchText = (): string | undefined => {
    return (
      document.getElementById(searchTextId) as HTMLInputElement
    )?.value.trim();
  };
}
