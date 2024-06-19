import { IFormState, IFormStateUpdate } from "../interfaces/iFormState";

export class FormStateMapper {
  static reduceState = (results: (IFormState | undefined)[]): IFormState => {
    const initialState: IFormState = {
      error: false,
      message: "",
    };
    return (
      results.reduce((acc, current) => {
        acc = acc || initialState;
        if (!current) return acc;
        acc.error ||= current.error;
        acc.message += `\n${current.message}`;
        if (current.newPassword) acc.newPassword = current.newPassword;
        return acc;
      }) || initialState
    );
  };

  // TODO: refactor to generics
  static reduceStateUpdate = (
    results: (IFormStateUpdate | undefined)[]
  ): IFormStateUpdate => {
    const initialState: IFormStateUpdate = {
      error: false,
      message: "",
    };
    return (
      results.reduce((acc, current) => {
        acc = acc || initialState;
        if (!current) return acc;
        acc.error ||= current.error;
        acc.message += `\n${current.message}`;
        return acc;
      }) || initialState
    );
  };
}
