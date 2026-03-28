$apikey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6d2F2b2pqaXNzamJ4ZmFxa2VnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1OTczMTMsImV4cCI6MjA5MDE3MzMxM30.ILHIZwvlSI7cDQIwQf27QJvBcBuMmE16aEzoSHr3r4A"
$headers = @{ "apikey" = $apikey; "Authorization" = "Bearer $apikey"; "Content-Type" = "application/json"; "Prefer" = "return=representation" }

$baseUrl = "https://vzwavojjissjbxfaqkeg.supabase.co/rest/v1"

Write-Host "Simulating Akshara Foundation (NGO ID 1) proof upload..."

# 1. Get Activity
$activity = Invoke-RestMethod -Uri "$baseUrl/activities?ngo_id=eq.1&limit=1" -Headers @{ "apikey" = $apikey }
if ($null -eq $activity) { Write-Error "No activity found."; exit }

$actId = $activity[0].id
Write-Host "Activity Found: $actId"

# 2. Upload Proof
$proof = @{
    activity_id = $actId
    ngo_id = 1
    after_image_url = "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1200"
    description = "Successfully distributed 100 library kits to kids in rural Salem hamlets."
    latitude = 11.6643
    longitude = 78.1460
    location_name = "Salem, TN"
    reverse_image_score = 98
    geotag_match_score = 100
    content_match_score = 95
    before_after_score = 92
    overall_trust_score = 96
    ai_verdict = "AUTHENTIC: Image confirms distribution of library materials at verified coordinates."
    status = "verified"
}

Invoke-RestMethod -Uri "$baseUrl/proof_submissions" -Method Post -Headers $headers -Body ($proof | ConvertTo-Json)

# 3. Update Activity Status
Invoke-RestMethod -Uri "$baseUrl/activities?id=eq.$actId" -Method Patch -Headers $headers -Body (@{ status = "verified" } | ConvertTo-Json)

# 4. Release Donations
Invoke-RestMethod -Uri "$baseUrl/donations?activity_id=eq.$actId" -Method Patch -Headers $headers -Body (@{ released = $true } | ConvertTo-Json)

Write-Host "✅ MISSION SUCCESS: Akshara Proof Upload & Verification Complete."
