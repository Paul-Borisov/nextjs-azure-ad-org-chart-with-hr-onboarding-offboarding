import { IUser } from "./iUser";

export interface IUserLevel extends IUser {
  level1?: string;
  level2?: string;
  level3?: string;
  level4?: string;
  level5?: string;
}
