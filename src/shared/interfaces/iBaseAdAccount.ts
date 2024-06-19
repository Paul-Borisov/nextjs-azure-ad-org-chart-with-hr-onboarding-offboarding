export interface IBaseAdAccount {
  accountEnabled: boolean;
  displayName: string;
  employeeId?: string;
  givenName?: string;
  mail: string;
  manager: string;
  mobile?: string;
  telephoneNumber?: string;
  password: string;
  photo?: string;
  sn?: string;
  title?: string;
  userPrincipalName: string;
  selectedGroups?: string[];
}
