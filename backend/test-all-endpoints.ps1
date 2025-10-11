# Mivvo Expertiz Backend - Tüm Endpoint'leri Test Etme Script'i
# Test Tarihi: 11 Ekim 2025

$ErrorActionPreference = "Continue"
$baseUrl = "http://localhost:3001"
$token = ""
$testResults = @()

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [object]$Body = $null,
        [string]$Category
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json)
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @params
        $result = @{
            Category = $Category
            Name = $Name
            Method = $Method
            Url = $Url
            Status = "✅ BAŞARILI"
            StatusCode = $response.StatusCode
            Response = $response.Content
        }
        Write-Host "✅ $Category - $Name : BAŞARILI" -ForegroundColor Green
        
    } catch {
        $result = @{
            Category = $Category
            Name = $Name
            Method = $Method
            Url = $Url
            Status = "❌ BAŞARISIZ"
            StatusCode = $_.Exception.Response.StatusCode.value__
            Error = $_.Exception.Message
        }
        Write-Host "❌ $Category - $Name : BAŞARISIZ" -ForegroundColor Red
    }
    
    $script:testResults += $result
    return $result
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  MIVVO EXPERTIZ API ENDPOINT TEST" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 1. HEALTH CHECK
Write-Host "`n### 1. HEALTH CHECK ###" -ForegroundColor Yellow
Test-Endpoint -Name "Health Check" -Method "GET" -Url "$baseUrl/health" -Category "System"

# 2. PUBLIC AUTH ENDPOINTS
Write-Host "`n### 2. PUBLIC AUTH ENDPOINTS ###" -ForegroundColor Yellow

# Register (yeni kullanıcı için rastgele email)
$randomEmail = "test$(Get-Random -Minimum 1000 -Maximum 9999)@example.com"
$registerBody = @{
    email = $randomEmail
    password = "test123456"
    firstName = "Test"
    lastName = "User"
}
$registerResult = Test-Endpoint -Name "Register" -Method "POST" -Url "$baseUrl/api/auth/register" -Body $registerBody -Category "Auth"

# Token'ı al
if ($registerResult.Status -eq "✅ BAŞARILI") {
    $registerData = $registerResult.Response | ConvertFrom-Json
    $script:token = $registerData.data.token
    Write-Host "Token alındı: $($script:token.Substring(0, 50))..." -ForegroundColor Gray
}

# Login
$loginBody = @{
    email = $randomEmail
    password = "test123456"
}
$loginResult = Test-Endpoint -Name "Login" -Method "POST" -Url "$baseUrl/api/auth/login" -Body $loginBody -Category "Auth"

# Token güncelle (login'den)
if ($loginResult.Status -eq "✅ BAŞARILI") {
    $loginData = $loginResult.Response | ConvertFrom-Json
    $script:token = $loginData.data.token
}

# 3. PROTECTED AUTH ENDPOINTS
Write-Host "`n### 3. PROTECTED AUTH ENDPOINTS ###" -ForegroundColor Yellow
$authHeaders = @{ "Authorization" = "Bearer $script:token" }

Test-Endpoint -Name "Get Profile" -Method "GET" -Url "$baseUrl/api/auth/profile" -Headers $authHeaders -Category "Auth"

# 4. USER MANAGEMENT
Write-Host "`n### 4. USER MANAGEMENT ###" -ForegroundColor Yellow
Test-Endpoint -Name "Get Credits" -Method "GET" -Url "$baseUrl/api/user/credits" -Headers $authHeaders -Category "User"
Test-Endpoint -Name "Get Reports" -Method "GET" -Url "$baseUrl/api/user/reports" -Headers $authHeaders -Category "User"
Test-Endpoint -Name "Get Credit History" -Method "GET" -Url "$baseUrl/api/user/credits/history" -Headers $authHeaders -Category "User"

# 5. VIN LOOKUP
Write-Host "`n### 5. VIN LOOKUP ###" -ForegroundColor Yellow
$vinBody = @{ vin = "1HGBH41JXMN109186" }
Test-Endpoint -Name "VIN Decode" -Method "POST" -Url "$baseUrl/api/vin/decode" -Body $vinBody -Category "VIN"
Test-Endpoint -Name "VIN Basic Info" -Method "GET" -Url "$baseUrl/api/vin/basic/1HGBH41JXMN109186" -Category "VIN"
Test-Endpoint -Name "VIN History" -Method "GET" -Url "$baseUrl/api/vin/history" -Category "VIN"

# 6. VEHICLE GARAGE
Write-Host "`n### 6. VEHICLE GARAGE ###" -ForegroundColor Yellow
$vehicleBody = @{
    plate = "34XYZ$(Get-Random -Minimum 100 -Maximum 999)"
    brand = "Toyota"
    model = "Corolla"
    year = 2020
    color = "Beyaz"
}
$vehicleResult = Test-Endpoint -Name "Add Vehicle" -Method "POST" -Url "$baseUrl/api/vehicle-garage" -Headers $authHeaders -Body $vehicleBody -Category "Vehicle Garage"

Test-Endpoint -Name "Get Vehicles" -Method "GET" -Url "$baseUrl/api/vehicle-garage" -Headers $authHeaders -Category "Vehicle Garage"

# Vehicle ID al
$vehicleId = $null
if ($vehicleResult.Status -eq "✅ BAŞARILI") {
    $vehicleData = $vehicleResult.Response | ConvertFrom-Json
    $vehicleId = $vehicleData.data.id
    Test-Endpoint -Name "Get Vehicle Detail" -Method "GET" -Url "$baseUrl/api/vehicle-garage/$vehicleId" -Headers $authHeaders -Category "Vehicle Garage"
}

# 7. PAYMENT
Write-Host "`n### 7. PAYMENT ###" -ForegroundColor Yellow
Test-Endpoint -Name "Get Payment Methods" -Method "GET" -Url "$baseUrl/api/payment/methods" -Headers $authHeaders -Category "Payment"
Test-Endpoint -Name "Get Payment History" -Method "GET" -Url "$baseUrl/api/payment/history" -Headers $authHeaders -Category "Payment"

$paymentBody = @{
    amount = 100
    paymentMethod = "CREDIT_CARD"
}
Test-Endpoint -Name "Create Payment" -Method "POST" -Url "$baseUrl/api/payment/create" -Headers $authHeaders -Body $paymentBody -Category "Payment"

# 8. AI ANALYSIS
Write-Host "`n### 8. AI ANALYSIS ###" -ForegroundColor Yellow
Test-Endpoint -Name "AI Status" -Method "GET" -Url "$baseUrl/api/ai-analysis/status" -Headers $authHeaders -Category "AI"
Test-Endpoint -Name "AI History" -Method "GET" -Url "$baseUrl/api/ai-analysis/history" -Headers $authHeaders -Category "AI"

# 9. AI TEST
Write-Host "`n### 9. AI TEST ###" -ForegroundColor Yellow
Test-Endpoint -Name "AI Test Status" -Method "GET" -Url "$baseUrl/api/ai-test/status" -Headers $authHeaders -Category "AI Test"

# 10. PAINT ANALYSIS
Write-Host "`n### 10. PAINT ANALYSIS ###" -ForegroundColor Yellow
$paintBody = @{
    vehicleInfo = @{
        plate = "34ABC123"
        make = "Toyota"
        model = "Corolla"
        year = 2020
    }
}
$paintResult = Test-Endpoint -Name "Paint Analysis Start" -Method "POST" -Url "$baseUrl/api/paint-analysis/start" -Headers $authHeaders -Body $paintBody -Category "Paint Analysis"

# 11. DAMAGE ANALYSIS  
Write-Host "`n### 11. DAMAGE ANALYSIS ###" -ForegroundColor Yellow
$damageBody = @{
    vehicleInfo = @{
        plate = "34ABC123"
        make = "Toyota"
        model = "Corolla"
        year = 2020
    }
}
$damageResult = Test-Endpoint -Name "Damage Analysis Start" -Method "POST" -Url "$baseUrl/api/damage-analysis/start" -Headers $authHeaders -Body $damageBody -Category "Damage Analysis"

# 12. VALUE ESTIMATION
Write-Host "`n### 12. VALUE ESTIMATION ###" -ForegroundColor Yellow
$valueBody = @{
    vehicleInfo = @{
        plate = "34ABC123"
        make = "Toyota"
        model = "Corolla"
        year = 2020
    }
}
$valueResult = Test-Endpoint -Name "Value Estimation Start" -Method "POST" -Url "$baseUrl/api/value-estimation/start" -Headers $authHeaders -Body $valueBody -Category "Value Estimation"

# 13. COMPREHENSIVE EXPERTISE
Write-Host "`n### 13. COMPREHENSIVE EXPERTISE ###" -ForegroundColor Yellow
$compBody = @{
    vehicleInfo = @{
        plate = "34ABC123"
        make = "Toyota"
        model = "Corolla"
        year = 2020
    }
}
$compResult = Test-Endpoint -Name "Comprehensive Expertise Start" -Method "POST" -Url "$baseUrl/api/comprehensive-expertise/start" -Headers $authHeaders -Body $compBody -Category "Comprehensive"

# SONUÇLARI ÖZETLE
Write-Host "`n`n============================================" -ForegroundColor Cyan
Write-Host "  TEST SONUÇLARI ÖZETİ" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$totalTests = $testResults.Count
$successfulTests = ($testResults | Where-Object { $_.Status -eq "✅ BAŞARILI" }).Count
$failedTests = $totalTests - $successfulTests
$successRate = [math]::Round(($successfulTests / $totalTests) * 100, 2)

Write-Host "`nToplam Test: $totalTests" -ForegroundColor White
Write-Host "Başarılı: $successfulTests" -ForegroundColor Green
Write-Host "Başarısız: $failedTests" -ForegroundColor Red
Write-Host "Başarı Oranı: $successRate%" -ForegroundColor $(if($successRate -gt 80) { "Green" } else { "Yellow" })

# Kategoriye göre sonuçlar
Write-Host "`n--- Kategoriye Göre Sonuçlar ---" -ForegroundColor Cyan
$testResults | Group-Object Category | ForEach-Object {
    $categoryTotal = $_.Count
    $categorySuccess = ($_.Group | Where-Object { $_.Status -eq "✅ BAŞARILI" }).Count
    $categoryRate = [math]::Round(($categorySuccess / $categoryTotal) * 100, 2)
    Write-Host "$($_.Name): $categorySuccess/$categoryTotal ($categoryRate%)" -ForegroundColor $(if($categoryRate -eq 100) { "Green" } elseif($categoryRate -gt 50) { "Yellow" } else { "Red" })
}

# Başarısız testleri listele
if ($failedTests -gt 0) {
    Write-Host "`n--- Başarısız Testler ---" -ForegroundColor Red
    $testResults | Where-Object { $_.Status -eq "❌ BAŞARISIZ" } | ForEach-Object {
        Write-Host "  • $($_.Category) - $($_.Name): $($_.Error)" -ForegroundColor Red
    }
}

# JSON rapor oluştur
$reportPath = "test-results-$(Get-Date -Format 'yyyyMMdd-HHmmss').json"
$testResults | ConvertTo-Json -Depth 10 | Out-File $reportPath
Write-Host "`n✅ Test raporu kaydedildi: $reportPath" -ForegroundColor Green

Write-Host "`n============================================`n" -ForegroundColor Cyan

