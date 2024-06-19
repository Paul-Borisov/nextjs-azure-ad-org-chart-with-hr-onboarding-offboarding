param(
  [object]$webhookdata
  ,[bool]$useWriteOutput = $true

  # $true enforces creating users in the given path. This is useful for safer testing. Use $false in Production.
  ,[bool]$enforceDefaultPath = $true
  ,[string]$defaultPath = "OU=Consultants,OU=Undefined,OU=Norway,OU=Country"
  ,[string]$propertyNameGroups = "selectedGroups"

  ,[string]$dateFormat = "dd.MM.yyyy"
  ,[string[]]$specialHandlingAttributes = @("accountEnabled", "manager", "password", "photo", "proxyAddresses", $propertyNameGroups)
  ,[string[]]$copyManagerAttributes = @(
    ,"l"
    ,"company"
    ,"co"
    ,"department"
    ,"extensionAttribute2"
    ,"extensionAttribute3"
    ,"extensionAttribute5"
    ,"extensionAttribute10"
    ,"extensionAttribute11"
    ,"extensionAttribute12"
    ,"physicalDeliveryOfficeName"
    ,"postalCode"
    ,"state"
    ,"streetAddress"
  )
  # More country codes: https://en.wikipedia.org/wiki/ISO_3166-1_numeric
  ,$mapCountryCodes = @{
    "de" = 276;
    "dk" = 208;
    "es" = 724;
    "fi" = 246;
    "fr" = 250;
    "it" = 380;
    "nl" = 578;
    "no" = 578;
    "pl" = 616;
    "pt" = 620;
    "se" = 752;
  }
  ,$mapAttributeNames = @{
    <#
    businessPhones = "telephoneNumber";
    city = "l";
    country = "co";
    firstName = "givenName";
    jobTitle = "title";
    lastName = "sn";
    mobilePhone = "mobile";
    officeLocation = "physicalDeliveryOfficeName";
    surname = "sn";
    #>
  }
)
######################################################## FUNCTIONS #########################################################
function EnsureUniqueSamAccountName() {
param(
  [string]$userPrincipalName
  ,[int]$topLimit = 20 # Max acceptable length for samAccountName
  ,[string]$restrictedTrailingChars = "[^A-Za-z0-9]+$"
)

  $samAccountName = ($userPrincipalName -replace "@.+","") -replace $restrictedTrailingChars,""
  if($samAccountName.Length -le $topLimit) {
    $account = Get-ADUser -Filter {samAccountName -eq $samAccountName}
    if(!$account) {return $samAccountName} # All is good; there is no active account with this valid samAccountName. It can be used.
  }
  
  $index = $null
  if( $samAccountName -match '\d+$' ) {
    $index = [int]($samAccountName -replace '^.+\D+(\d+)$','$1')
    # Strip trailing numbers like magnus.hanson.kris-.3545 => magnus.hanson.kris
    $samAccountName = ($samAccountName -replace '(\d+)$') -replace $restrictedTrailingChars,""
  } else {
    $index = 2 # default starting index
    if( $samAccountName.Length -gt $topLimit ) {
      $samAccountName = $samAccountName.Substring(0, $topLimit) -replace $restrictedTrailingChars,""
    }
    $account = Get-ADUser -Filter {samAccountName -eq $samAccountName}
    if(!$account) {return $samAccountName} # All is good; there is no active account with this reduced samAccountName. It can be used.
  }

  while( $true ) {
    $maxLength = $samAccountName.Length + $index.ToString().Length
    if( $maxLength -gt $topLimit ) {$maxLength = $samAccountName.Length - ($maxLength - $topLimit)}
    if( $samAccountName.Length -gt $maxLength ) {
      $uniqueSamAccountName = ($samAccountName.Substring(0, $maxLength) -replace $restrictedTrailingChars,"") + $index.ToString()
    } else {
      $uniqueSamAccountName = $samAccountName + $index.ToString()
    }
    $account = Get-ADUser -Filter {samAccountName -eq $uniqueSamAccountName}
    #if(!$account -and "magnus.hanson.kr3545","magnus.hanson.kr3546","magnus.hanson.krist2" -inotcontains $uniqueSamAccountName) {break}
    if(!$account) {break}
    $index++
  }   
 
  return $uniqueSamAccountName
}

function GetCountryCode() {
param(
  [string]$userPrincipalName
)

  $c = [System.IO.Path]::GetExtension($userPrincipalName) -replace "\."
  $countryCode = $mapCountryCodes[$c.ToLower()]
  if(!$countryCode) {$countryCode = 840} # US
  return $countryCode
}

function GetUsageLocation() {
param(
  [string]$userPrincipalName
)

  $c = [System.IO.Path]::GetExtension($userPrincipalName) -replace "\."
  return (&{if($c.Length -eq 2){$c.ToUpper()}else{"US"}})
}

function WriteHost() {
param(
  [Parameter(Mandatory=$false)][string]$message = ""
  ,[Parameter(Mandatory=$false)][switch]$NoNewLine
  ,[Parameter(Mandatory=$false)][string]$ForegroundColor
  ,[Parameter(Mandatory=$false)][switch]$local
)
  
  if( $useWriteOutput ) {
    if( !$local ) {
      Write-Output $message
    }
  } else {
    if( $NoNewLine ) {
      if( $ForegroundColor ) {
        Write-Host $message -NoNewLine -ForegroundColor $ForegroundColor
      } else {
        Write-Host $message -NoNewLine
      }
    } else {
      if( $ForegroundColor ) {
        Write-Host $message -ForegroundColor $ForegroundColor
      } else {
        Write-Host $message
      }
    }
  }
}
####################################################### //FUNCTIONS ########################################################

####################################################### EXECUTION ##########################################################
$message = "Session started: " + (get-date).ToString("$dateFormat HH\:mm\:ss")
WriteHost $message

if($webhookdata -and $webhookdata.GetType().Name -eq "String") {
  $webhookdata = ConvertFrom-Json $webhookdata
}
if( !($webhookdata -and $webhookdata.RequestBody -and $webhookdata.RequestBody.StartsWith("{")) ) {
  WriteHost "ERROR: request body must be submitted"
  $message = "Session ended: " + (get-date).ToString("$dateFormat HH\:mm\:ss")
  return
}
$userInfo = ConvertFrom-Json -InputObject $webhookdata.RequestBody

$path = $defaultPath.TrimEnd(",") + "," + (Get-ADDomain).DistinguishedName

$otherAttributes = @{}
$manager = $null
if( $userInfo.manager ) {
  $manager = $userInfo.manager
  $manager = Get-ADUser -Filter {userPrincipalName -eq $manager} -Properties * | select-object -first 1
  if( $manager -and $manager.DistinguishedName -and !$enforceDefaultPath ) {
    $path = $manager.DistinguishedName.Substring($manager.DistinguishedName.IndexOf(',') + 1)
  }
  if( $manager -and $copyManagerAttributes ) {
    foreach( $name in $copyManagerAttributes ) {
      $value = $null; $value = $manager.$name
      if( $value ) {
        $otherAttributes[$name] = $value
        WriteHost "$name=$value"
      }
    }    
  }
}

foreach( $key in $userInfo.psobject.properties.name) {
  if($specialHandlingAttributes -icontains $key) {continue}
  $mapped = $null; $mapped = $mapAttributeNames[$key]
  $name = $null; $name = (&{if($mapped){$mapped}else{$key}})
  $value = $null; $value = $userInfo.$key
  if( $value ) {
    $otherAttributes[$name] = $value
    WriteHost "$name=$value"
  }
}

$accountEnabled = ($null -eq $userInfo.accountEnabled) -or $userInfo.accountEnabled
$accountPassword = (ConvertTo-SecureString $userInfo.password -AsPlainText -Force)
$name = $userInfo.displayName
#$samAccountName = $userInfo.userPrincipalName -replace "@.+"
$samAccountName = EnsureUniqueSamAccountName -userPrincipalName $userInfo.userPrincipalName
WriteHost "samAccountName=$samAccountName"
WriteHost "accountEnabled=$accountEnabled"


WriteHost "Adding new AD user to $path"
$user = New-ADUser -Enabled $accountEnabled -SamAccountName $samAccountName -Name $name `
  -AccountPassword $accountPassword -OtherAttributes $otherAttributes -Path $path

$user = Get-ADUser -Filter {samAccountName -eq $samAccountName} | select-object -first 1
if( $user ) {
  # Set change password at logon
  $user | Set-ADUser -ChangePasswordAtLogon $true

  # Set user's manager
  if( $manager ) {
    WriteHost "manager=$($manager.userPrincipalName)"
    $user | Set-ADUser -Manager $manager    
  }

  # Set proxy addresses
  $proxyAddresses = @("SIP:$($userInfo.userPrincipalName)","SMTP:$($userInfo.userPrincipalName)")
  WriteHost "proxyAddresses=[$([string]::Join(',',$proxyAddresses))]"
  $user | Set-ADUser -Add @{proxyAddresses = $proxyAddresses}

  # Setting usage location. Microsoft, why is this so meaninglessly complicated?
  # Your UL rules change all the time. Why don't you just take it from Country?
  $countryCode = GetCountryCode -userPrincipalName $userInfo.userPrincipalName
  if( $countryCode ) {
    WriteHost "countryCode=$countryCode"
    $user | Set-ADUser -Replace @{countryCode = $countryCode;}
  }
  $usageLocation = GetUsageLocation -userPrincipalName $userInfo.userPrincipalName
  if( $usageLocation ) {
    WriteHost "usageLocation=$usageLocation"
    $user | Set-ADUser -Replace @{C = $usageLocation; msExchUsageLocation = $usageLocation;}
  }

  # Add the new user to selectedGroups
  if( $userInfo.$propertyNameGroups ) {
    WriteHost "Adding new user to groups"
    $allGroups = $userInfo.$propertyNameGroups.Split(',')
    foreach( $groupIdentity in $allGroups ) {
      $groupIdentity = $groupIdentity.Trim()
      WriteHost " $groupIdentity"
      $group = $null; $group = Get-ADGroup -Identity $groupIdentity -ErrorAction SilentlyContinue
      if($? -and $group) {
        $group | Add-ADGroupMember -Members $user
        if( $? ) {
          WriteHost "  added"
        } else {
          WriteHost "  error"
        }
      } else {
        WriteHost "  group not found"
      }
    }
  }

  # Set user's photo
  if( $userInfo.photo ) {
    WriteHost "Adding user photo"
    $photo = [System.Convert]::FromBase64String($userInfo.photo)
    $user | Set-ADUser -Replace @{thumbnailPhoto = $photo}
    if(!$?) {
      WriteHost " error"
    } else {
      WriteHost " added"
    }
  }
}

$message = "Session ended: " + (get-date).ToString("$dateFormat HH\:mm\:ss")
WriteHost $message