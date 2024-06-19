export interface IAzureAccount {
  businessPhones?: string[];
  city?: string;
  companyName?: string;
  country?: string;
  department?: string;
  displayName: string;
  employeeId?: string;
  givenName?: string;
  id?: string;
  imAddresses?: string[];
  jobTitle?: string;
  mail?: string;
  manager?: { "@odata.id": string } | string;
  mobilePhone?: string;
  officeLocation?: string;
  onPremisesExtensionAttributes?: { [key: string]: string };
  postalCode?: string;
  proxyAddresses?: string[];
  state?: string;
  streetAddress?: string;
  surname?: string;
  usageLocation?: string;
  userPrincipalName: string;
}
