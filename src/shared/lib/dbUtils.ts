export default class DbUtils {
  static loadPhotosFromDatabase = async () =>
    fetch(`${window.origin}/api/dbphoto`)
      .then((r) => r.json())
      .catch((e) => {
        console.log(e);
        return {};
      });
}
