import { IUserLevel } from "./iUserLevel";

export interface IUnit {
  name: string;
  e?: IUserLevel[];
  units?: IUnit[];
}
