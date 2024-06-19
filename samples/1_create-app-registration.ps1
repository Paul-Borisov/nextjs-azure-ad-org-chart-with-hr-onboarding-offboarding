param(
  [string]$moduleName = "AzureAD"
  ,[string]$appName = "nextjs-hr-app-auth"
  ,[string[]]$replyUrls = @("http://localhost:3000/api/auth/callback/microsoft-entra-id")
  #,[string[]]$replyUrls = @("http://localhost:3000/api/auth/callback/microsoft-entra-id","http://localhost:3000/api/auth/callback/google")
  ,[DateTime]$secretExpiration = (Get-Date).Date.AddYears(2)
  ,$graphPermissions = @{
    "User.ReadWrite.All" = "204e0828-b5ca-4ad8-b9f3-f32a958e7cc4"
    "Directory.AccessAsUser.All" = "0e263e50-5827-48a4-b97c-d940288653c7"
    "Directory.Read.All" = "06da0dbc-49e2-44d2-8312-53f166ab848a"
    "Group.ReadWrite.All" = "4e46008b-f24c-477d-8fff-7bb4ec7aafe0"
    "offline_access" = "7427e0e9-2fba-42fe-b0c0-848c9e6a8182"
  }
  #,$sharepointPermissions = @{
  #  "AllSites.Write" = "640ddd16-e5b7-4d71-9690-3f4022699ee7"
  #}  
)

$existingModule = Get-Module $moduleName
if(!$existingModule) {
  $existingModule = Get-Module $moduleName -ListAvailable
  if(!$existingModule) {
    Install-Module -Name $moduleName
    if($?) {
      Import-Module $moduleName
    }
  } else {
    Import-Module $moduleName
    $existingModule = Get-Module $moduleName
  }
}
if(!$existingModule) {
  Write-Output "ERROR: module '$moduleName' not found. Please install it to continue"
  return
}

Connect-AzureAD
if(!$?) {
  Write-Output "ERROR: could not connect to $moduleName"
  return
}

# Add the app
$appRegistration = New-AzureADApplication -DisplayName $appName -ReplyUrls $replyUrls
#$appRegistration = New-AzureADApplication -DisplayName $appName -ReplyUrls $replyUrls -Oauth2AllowImplicitFlow $true
if(!$?) {return}

# Add service principal
$servicePrincipal = New-AzureADServicePrincipal -AppId $appRegistration.AppId
if(!$?) {return}

# Add client secret
$clientSecret = New-AzureADApplicationPasswordCredential -ObjectId $appRegistration.ObjectId `
  -CustomKeyIdentifier "ClientSecret" -EndDate $secretExpiration
if(!$?) {return}

Write-Output "App Registration created successfully"
Write-Output "Client ID: $($appRegistration.AppId)"
Write-Output "Client Secret: $($clientSecret.Value)"

# Set the permissions
$graphApiId = (Get-AzureADServicePrincipal -Filter "DisplayName eq 'Microsoft Graph'").AppId
$requiredResourceAccess = New-Object Microsoft.Open.AzureAD.Model.RequiredResourceAccess
$requiredResourceAccess.ResourceAppId = $graphApiId
foreach($key in $graphPermissions.Keys) {
  $delegatedPermission = New-Object Microsoft.Open.AzureAD.Model.ResourceAccess
  $delegatedPermission.Id = $graphPermissions.$key
  $delegatedPermission.Type = "Scope"
  $requiredResourceAccess.ResourceAccess += $delegatedPermission
}
Set-AzureADApplication -ObjectId $appRegistration.ObjectId -RequiredResourceAccess @($requiredResourceAccess)

if($sharepointPermissions) {
  $sharepointApiId = (Get-AzureADServicePrincipal -Filter "DisplayName eq 'Office 365 SharePoint Online'").AppId
  $requiredResourceAccess2 = New-Object Microsoft.Open.AzureAD.Model.RequiredResourceAccess
  $requiredResourceAccess2.ResourceAppId = $sharepointApiId
  foreach($key in $sharepointPermissions.Keys) {
    $delegatedPermission = New-Object Microsoft.Open.AzureAD.Model.ResourceAccess
    $delegatedPermission.Id = $sharepointPermissions.$key
    $delegatedPermission.Type = "Scope"
    $requiredResourceAccess2.ResourceAccess += $delegatedPermission
  }
  Set-AzureADApplication -ObjectId $appRegistration.ObjectId -RequiredResourceAccess @($requiredResourceAccess,$requiredResourceAccess2)
}