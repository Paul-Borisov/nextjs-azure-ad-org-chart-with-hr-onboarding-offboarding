export default class LevelUtils {
  public static readonly storageKey = "org-structure-selected-levels";
  public static readonly storageKeyMaxColumns = "org-structure-max-columns";

  static cleanSelectedLevels() {
    localStorage?.removeItem(this.storageKey);
  }

  static cleanSelectedMaxColumns() {
    localStorage?.removeItem(this.storageKeyMaxColumns);
  }

  static formatWithSpaces(text: string) {
    const newText = `${text[0].toUpperCase()}${text
      .substring(1)
      .replace(/([A-Z]|\d+)/g, " $1")}`;
    return newText;
  }

  static isDialogOpen = () => {
    return document.querySelector(`.${this.storageKey}`);
  };

  static getSelectedMaxColumns = () => {
    return localStorage?.getItem(this.storageKeyMaxColumns);
  };

  static getSelectedLevels = () => {
    let savedValues: string[] | undefined;
    const sessionData = localStorage?.getItem(this.storageKey);
    if (sessionData) {
      try {
        savedValues = JSON.parse(sessionData);
      } catch (e) {
        console.log(e);
      }
    }
    return savedValues;
  };

  static getUISelections = () => {
    const selectedData: string[] = [];
    document
      .querySelectorAll<HTMLInputElement>(`input.${this.storageKey}`)
      .forEach((e) => {
        const userAttributeForSelectedLevel = e.value;
        if (userAttributeForSelectedLevel) {
          selectedData.push(userAttributeForSelectedLevel);
        }
      });
    return selectedData?.length ? selectedData : undefined;
  };

  static getUISelectedMaxColumns = () => {
    const selectedData: string | undefined = document.querySelector(
      `.${this.storageKeyMaxColumns}`
    )?.innerHTML;
    return selectedData ? selectedData : undefined;
  };

  static saveSelectedLevels(levels: string[]) {
    localStorage?.setItem(this.storageKey, JSON.stringify(levels));
  }

  static saveSelectedMaxColumns(maxColumns: string) {
    localStorage?.setItem(this.storageKeyMaxColumns, maxColumns);
  }
}
