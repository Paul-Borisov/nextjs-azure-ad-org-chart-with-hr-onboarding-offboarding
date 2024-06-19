export interface IUser {
  city?: string;
  companyName?: string;
  country?: string;
  department?: string;
  displayName: string;
  id: string;
  isDirty?: boolean;
  jobTitle: string;
  manager?: string;
  managerUpn?: string;
  managerUpnNotFound?: boolean;
  officeLocation: string;
  onPremisesExtensionAttributes: { [key: string]: string };
  photo?: string;
  userPrincipalName: string;
}
