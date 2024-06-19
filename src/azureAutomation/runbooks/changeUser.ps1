param(
  [object]$webhookdata
  ,[bool]$useWriteOutput = $true
  
  ,[string]$dateFormat = "dd.MM.yyyy"
  ,[string[]]$specialHandlingAttributes = @("userPrincipalName", "disableAccount", "removeAccount")
  ,$mapAttributeNames = @{}
)
######################################################## FUNCTIONS #########################################################
function GenerateRandomPassword {
param (
  [int]$passwordLength = 18,
  [bool]$enforceLowerCase = $true,
  [bool]$enforceUpperCase = $true,
  [bool]$enforceNumbers = $true,
  [bool]$enforceExtraChars = $true
)

  $chars = ""
  if ($enforceLowerCase) { $chars += "abcdefghijklmnopqrstuvwxyz" }
  if ($enforceUpperCase) { $chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ" }
  if ($enforceNumbers) { $chars += "0123456789" }
  if ($enforceExtraChars) { $chars += "!@#$%^&*()" }

  $password = ""
  for( $i = 0; $i -lt $passwordLength; $i++ ) {
    $password += $chars.Substring((Get-Random -Maximum $chars.Length), 1)
  }

  return $password
}

function RemoveUserFromAllGroups() {
param(
  $user
)
  $userGroups = @() + (Get-ADUser -Identity $user -Properties MemberOf | Select-Object -ExpandProperty MemberOf)
  foreach( $group in $userGroups ) {
    Remove-ADGroupMember -Identity $group -Members $user -Confirm:$false
  }
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
  WriteHost $message    
  return
}

$userInfo = ConvertFrom-Json -InputObject $webhookdata.RequestBody
$userPrincipalName = $userInfo.userPrincipalName
if(!$userPrincipalName) {
  WriteHost "ERROR: userPrincipalName must be provided"
  $message = "Session ended: " + (get-date).ToString("$dateFormat HH\:mm\:ss")
  WriteHost $message
  return
}
$user = Get-ADUser -Filter {userPrincipalName -eq $userPrincipalName} | select -first 1
if(!$user) {
  WriteHost "ERROR: AD User not found for $userPrincipalName"
  $message = "Session ended: " + (get-date).ToString("$dateFormat HH\:mm\:ss")
  WriteHost $message
  return
}

$disableAccount = $userInfo.disableAccount
$removeAccount = $userInfo.removeAccount
if( $disableAccount ) {
  $message = $user.DistinguishedName + ": $userPrincipalName"
  WriteHost $message
  WriteHost " resetting password"
  $randomPassword = GenerateRandomPassword
  $user | Set-ADAccountPassword -Reset -NewPassword (ConvertTo-SecureString -AsPlainText $randomPassword -Force)
  if($?){
    WriteHost "  OK"
  } else {
    WriteHost "  Error"
  }
  WriteHost " removing from all groups"
  RemoveUserFromAllGroups -user $user
  $user | Set-ADUser -Replace @{"Description" = "Ended on " + (Get-Date).ToString($dateFormat)}
  if($?){
    WriteHost "  OK"
  } else {
    WriteHost "  Error"
  }
  WriteHost " disabling the user"
  $user | Set-ADUser -Enabled $false
  $user | Set-ADUser -ChangePasswordAtLogon $true
  if($?){
    WriteHost "  OK"
  } else {
    WriteHost "  Error"
  }
} elseif( $removeAccount ) {
  $message = $user.DistinguishedName + ": $userPrincipalName"
  WriteHost $message
  WriteHost " removing the user"
  $user | Remove-ADUser -Confirm:$false
  if($?){
    WriteHost "  OK"
  } else {
    WriteHost "  Error"
  }  
} else {
  $otherAttributes = @{}
  foreach( $key in $userInfo.psobject.properties.name) {
    if($specialHandlingAttributes -icontains $key) {continue}
    $mapped = $null; $mapped = $mapAttributeNames[$key]
    $name = $null; $name = (&{if($mapped){$mapped}else{$key}})
    $value = $null; $value = $userInfo.$key
    if( $value ) {
      $otherAttributes[$name] = $value
      #WriteHost "$name=$value"
    }
  }

  WriteHost "Updating properties of $userPrincipalName"
  foreach($key in $otherAttributes.Keys) {
    WriteHost "$key=$($otherAttributes.$key)"
    $user | Set-ADUser -Replace @{$key = $otherAttributes.$key}
    if($?) {
      WriteHost " OK"
    } else {
      WriteHost " Error"
    }
  }
}

$message = "Session ended: " + (get-date).ToString("$dateFormat HH\:mm\:ss")
WriteHost $message