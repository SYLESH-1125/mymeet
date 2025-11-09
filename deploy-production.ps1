# 🚀 Quick Production Setup Script

Write-Host "🎓 EduMeet Production Deployment" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if we're in the right directory
$currentPath = Get-Location
if ($currentPath -notlike "*mymeet*") {
    Write-Host "❌ Error: Not in mymeet directory" -ForegroundColor Red
    Write-Host "Run: cd 'w:\mymeet''" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ In correct directory: $currentPath" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Build the project
Write-Host "🔨 Building production bundle..." -ForegroundColor Yellow
pnpm build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed - check errors above" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

# Step 4: Check Firebase CLI
Write-Host "🔥 Checking Firebase CLI..." -ForegroundColor Yellow
$firebaseInstalled = Get-Command firebase -ErrorAction SilentlyContinue
if (-not $firebaseInstalled) {
    Write-Host "📥 Installing Firebase CLI..." -ForegroundColor Yellow
    npm install -g firebase-tools
}
Write-Host "✅ Firebase CLI ready" -ForegroundColor Green
Write-Host ""

# Step 5: Deploy Firestore rules
Write-Host "🔐 Deploying Firestore rules..." -ForegroundColor Yellow
Write-Host "   (You may need to login to Firebase)" -ForegroundColor Gray
firebase deploy --only firestore
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Firestore deployment failed - you may need to run 'firebase login' first" -ForegroundColor Yellow
}
Write-Host ""

# Step 6: Summary
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "✨ Production Setup Complete!" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Test locally: pnpm start" -ForegroundColor White
Write-Host "   2. Deploy to Vercel: vercel --prod" -ForegroundColor White
Write-Host "   3. Add environment variables in Vercel dashboard" -ForegroundColor White
Write-Host "   4. Update Google OAuth with production domain" -ForegroundColor White
Write-Host ""
Write-Host "📚 Full guide: See PRODUCTION_READY.md" -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Ready for 1000+ students!" -ForegroundColor Green
