export interface IFormState extends IFormStateUpdate {
  listItemId?: number;
  newPassword?: string;
  newUserPrincipalName?: string;
}

export interface IFormStateUpdate {
  error: boolean;
  message: string;
}
