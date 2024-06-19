import { IUnit } from "../interfaces/iUnit";
import { IUser } from "../interfaces/iUser";
import { UserMapper } from "./userMapper";

export const topManagers =
  /^\s*board member|chairman of board|chief executive officer|chief financial officer|chief operating officer|ceo|cfo|coo|chairman\s*$/i;

export class UnitMapper {
  static extractAllUsers(units?: IUnit[]): IUser[] | undefined {
    if (!units) return undefined;

    const allUsers: IUser[] = [];
    units.forEach((u) => {
      if (u.e?.length) {
        allUsers.push(...u.e);
      }
      if (u.units?.length) {
        const sub = this.extractAllUsers(u.units);
        if (sub?.length) {
          allUsers.push(...sub);
        }
      }
    });
    return allUsers;
  }

  static getOrgStructure(
    users?: IUser[],
    root: string = "Company",
    unknownOu: string = "Undefined Unit",
    levelProperties?: string[]
  ): IUnit[] | undefined {
    if (!users) return undefined;

    const ensureUnit = (
      parent: IUnit | IUnit[],
      emp: IUser,
      unitName: string,
      unitNameOnNextLevel?: string
    ): IUnit => {
      let units: IUnit[];
      if (Array.isArray(parent)) {
        // Top level
        units = parent;
      } else {
        // Any sublevel
        if (!parent.units) {
          parent.units = [];
        }
        units = parent.units;
      }

      let unit = units.find((u) => u.name === unitName);
      if (!unit) {
        unit = { name: unitName };
        units.push(unit);
      }
      if (!unitNameOnNextLevel) {
        unit.e = unit.e || [];
        unit.e.push(emp);
      }
      return unit;
    };

    const getPromoted = (a: IUnit, b: IUnit): number | undefined => {
      if (a.name === root || (a && !b)) {
        return -1;
      } else if (b.name === root || (!a && b)) {
        return 1;
      } else if (a.name === unknownOu || (a && !b)) {
        return 1;
      } else if (b.name === unknownOu || (!a && b)) {
        return -1;
      } else if (topManagers.test(a.name)) {
        return -1;
      } else if (topManagers.test(b.name)) {
        return 1;
      }
      return undefined;
    };

    const sortUnits = (unit: IUnit[] | IUnit) => {
      if (Array.isArray(unit)) {
        unit.sort((a, b) => {
          const promoted = getPromoted(a, b);
          if (promoted) return promoted;

          return a.name?.toLocaleLowerCase() > b.name?.toLocaleLowerCase()
            ? 1
            : a.name?.toLocaleLowerCase() < b.name?.toLocaleLowerCase()
            ? -1
            : 0;
        });
        unit.forEach((u) => sortUnits(u));
      } else {
        unit.e?.sort((a, b) =>
          a.displayName.toLocaleLowerCase() > b.displayName.toLocaleLowerCase()
            ? 1
            : a.displayName.toLocaleLowerCase() <
              b.displayName.toLocaleLowerCase()
            ? -1
            : 0
        );
        if (unit.e) {
          UserMapper.resolveManagerUpn(unit.e);
        }
        if (unit.units) {
          sortUnits(unit.units);
        }
      }
    };

    const units: IUnit[] = [];
    const levels: string[] = [];
    UserMapper.getUserLevels(users, levelProperties).forEach((emp) => {
      if (!levels.length) {
        levels.push(
          ...Object.keys(emp).filter((key) => key.startsWith("level"))
        );
      }

      let unit: IUnit | IUnit[] = units;
      let stop = false;
      levels.forEach((currentLevel, index, arr) => {
        if (stop) return;
        let unitNname: string = (emp as any)[currentLevel];
        if (index === 0) {
          unitNname =
            unitNname || (topManagers.test(emp.jobTitle) ? root : unknownOu);
        }
        if (!unitNname) return;

        const nextLevel = arr.length > index + 1 ? arr[index + 1] : undefined;
        const unitNameOnNextLevel: string = nextLevel
          ? (emp as any)[nextLevel]
          : undefined;
        unit = ensureUnit(unit, emp, unitNname, unitNameOnNextLevel);
        if (!unitNameOnNextLevel) stop = true;
      });

      // Sorting in alpabet order
      sortUnits(units);
    });
    return units;
  }
}
