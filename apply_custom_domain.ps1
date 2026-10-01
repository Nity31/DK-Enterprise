# PowerShell script to add dkenterprise.com to hosts file and setup port 80 proxy
$hostsPath = "$env:Windir\System32\drivers\etc\hosts"

# Add hosts entries if missing
$hostsContent = Get-Content $hostsPath -ErrorAction SilentlyContinue
if ($hostsContent -notcontains "127.0.0.1    dkenterprise.com") {
    Add-Content -Path $hostsPath -Value "`n127.0.0.1    dkenterprise.com"
    Add-Content -Path $hostsPath -Value "127.0.0.1    dkenterprise"
    Add-Content -Path $hostsPath -Value "127.0.0.1    dkenterprise.local"
}

# Add Port 80 -> Port 5000 forwarding
netsh interface portproxy add v4tov4 listenport=80 listenaddress=127.0.0.1 connectport=5000 connectaddress=127.0.0.1
