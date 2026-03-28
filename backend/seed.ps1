$url = "https://vzwavojjissjbxfaqkeg.supabase.co/rest/v1/activities"
$headers = @{
    "apikey"="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6d2F2b2pqaXNzamJ4ZmFxa2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTczMTMsImV4cCI6MjA5MDE3MzMxM30.ILHIZwvlSI7cDQIwQf27QJvBcBuMmE16aEzoSHr3r4A"
    "Authorization"="Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6d2F2b2pqaXNzamJ4ZmFxa2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTczMTMsImV4cCI6MjA5MDE3MzMxM30.ILHIZwvlSI7cDQIwQf27QJvBcBuMmE16aEzoSHr3r4A"
    "Content-Type"="application/json"
    "Prefer"="return=minimal"
}

$activities = @(
    @{
        ngo_id = 1
        title = "Akshara: Rural Literacy Drive"
        description = "Distributing 100 sets of textbooks and stationary to village schools."
        category = "Education"
        target_amount = 25000
        raised_amount = 12000
        donor_count = 5
        status = "fundraising"
        before_image = "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1200"
        deadline = "2026-04-20"
        location_name = "Salem, TN"
    },
    @{
        ngo_id = 2
        title = "Green Earth: Urban Reforestation"
        description = "Planting 500 native saplings in Chennai's industrial zones."
        category = "Environment"
        target_amount = 50000
        raised_amount = 42000
        donor_count = 12
        status = "fundraising"
        before_image = "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200"
        deadline = "2026-05-15"
        location_name = "Ambattur, Chennai"
    },
    @{
        ngo_id = 7
        title = "Health First: Tribal Health Camp"
        description = "Providing primary health checkups for 200 tribal families in Kolli Hills."
        category = "Health"
        target_amount = 80000
        raised_amount = 65000
        donor_count = 20
        status = "fundraising"
        before_image = "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=1200"
        deadline = "2026-04-30"
        location_name = "Kolli Hills, Namakkal"
    }
)

$json = $activities | ConvertTo-Json
Invoke-RestMethod -Uri $url -Headers $headers -Method Post -Body $json
Write-Host "MISSION SUCCESS: Activities deployed."
