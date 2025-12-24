# Knowledge Base Content Extraction Script
# Parses netlify-analysis files and generates SQL INSERT statements

param(
    [string]$SourceDir = "netlify-analysis",
    [string]$OutputFile = "seeds\003-extracted-content.sql"
)

$ErrorActionPreference = "Stop"

Write-Host "`n════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  📚 KNOWLEDGE BASE CONTENT EXTRACTOR" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Initialize output
$sqlStatements = @"
-- Knowledge Base Content Extracted from Existing Files
-- Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

"@

$articleCount = 0

# Category mappings
$categoryMappings = @{
    'foreclosure' = 'pre-foreclosure-basics'
    'credit'      = 'credit-repair-fundamentals'
    'contract'    = 'legal-guides'
    'wholesale'   = 'wholesale-contracts'
    'flip'        = 'fix-flip-strategies'
    'refi'        = 'property-analysis'
    'cashout'     = 'property-analysis'
    'membership'  = 'real-estate-investing-101'
    'calculator'  = 'calculators'
    'admin'       = 'property-analysis'
}

# Tier mappings
$tierMappings = @{
    'basic'    = 'basic'
    'premium'  = 'premium'
    'elite'    = 'elite'
    'legal'    = 'premium'
    'contract' = 'premium'
    'admin'    = 'elite'
}

function Get-CategoryFromFilename {
    param([string]$filename)
    
    $lower = $filename.ToLower()
    foreach ($key in $categoryMappings.Keys) {
        if ($lower -Contains $key) {
            return $categoryMappings[$key]
        }
    }
    return 'real-estate-investing-101'
}

function Get-TierFromContent {
    param([string]$content, [string]$filename)
    
    $lower = $content.ToLower() + $filename.ToLower()
    
    if ($lower -match 'elite|admin|advanced|premium only') {
        return 'elite'
    }
    elseif ($lower -match 'premium|professional|pro|legal|contract') {
        return 'premium'
    }
    return 'basic'
}

function Extract-Title {
    param([string]$filename)
    
    # Remove file extension
    $title = [System.IO.Path]::GetFileNameWithoutExtension($filename)
    
    # Clean up common prefixes
    $title = $title -replace '^(export const|interface|type|function)\s+', ''
    $title = $title -replace '\s+=\s+.*$', ''
    
    # Convert camelCase and PascalCase to Title Case
    $title = $title -creplace '([a-z])([A-Z])', '$1 $2'
    $title = $title -replace '[-_]', ' '
    
    # Capitalize
    $title = (Get-Culture).TextInfo.ToTitleCase($title.ToLower())
    
    return $title
}

function Extract-Keywords {
    param([string]$content, [string]$title)
    
    $keywords = @()
    
    # Extract common real estate terms
    $terms = @(
        'foreclosure', 'credit', 'DSCR', 'ROI', '1%', 'rental', 'flip', 
        'wholesale', 'contract', 'loan', 'mortgage', 'refinance', 'property',
        'investment', 'cash flow', 'calculator', 'analysis', 'repair'
    )
    
    foreach ($term in $terms) {
        if ($content -match $term -or $title -match $term) {
            $keywords += $term
        }
    }
    
    return $keywords | Select-Object -Unique
}

function Sanitize-SQL {
    param([string]$text)
    return $text -replace "'", "''"
}

function Generate-Slug {
    param([string]$title)
    return $title.ToLower() -replace '[^a-z0-9\s-]', '' -replace '\s+', '-'
}

# Process legal guides
Write-Host "📄 Processing legal guides..." -ForegroundColor Yellow

$legalFiles = @(
    'Cash-Out Refinance Application Legal Guide.txt',
    'Fix-and-Flip Real Estate Contract Legal Guide.txt'
)

foreach ($file in $legalFiles) {
    $filePath = Join-Path $SourceDir $file
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        $title = Extract-Title $file
        $slug = Generate-Slug $title
        $category = 'legal-guides'
        $tier = 'premium'
        
        $excerpt = if ($content.Length -gt 200) { 
            (Sanitize-SQL $content.Substring(0, 200)) + "..." 
        }
        else { 
            Sanitize-SQL $content 
        }
        
        $fullContent = Sanitize-SQL $content
        $keywords = Extract-Keywords $content $title
        $keywordsArray = "ARRAY['" + ($keywords -join "','") + "']"
        $tagsArray = "ARRAY['legal','guide','premium','real-estate']"
        
        $articleCount++
        
        $sqlStatements += @"

-- Article $articleCount: $title
INSERT INTO knowledge_base (
    id, title, slug, content, excerpt, category, tier_level, 
    keywords, tags, author, status, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    '$title',
    '$slug',
    '$fullContent',
    '$excerpt',
    '$category',
    '$tier',
    $keywordsArray,
    $tagsArray,
    'System',
    'published',
    NOW(),
    NOW()
);

"@
        Write-Host "  ✓ Extracted: $title" -ForegroundColor Green
    }
}

# Process membership tiers
Write-Host "`n📊 Processing membership documentation..." -ForegroundColor Yellow

$membershipFile = Join-Path $SourceDir "MEMBERSHIP TIERS.txt"
if (Test-Path $membershipFile) {
    $content = Get-Content $membershipFile -Raw
    $title = "Membership Tiers & Benefits Complete Guide"
    $slug = "membership-tiers-benefits-guide"
    
    $excerpt = "Comprehensive breakdown of Basic (Free), Premium ($97/mo), and Elite ($297/mo) membership levels with all features, limits, and benefits explained."
    
    $fullContent = Sanitize-SQL $content
    $keywords = @('membership', 'tiers', 'pricing', 'benefits', 'features', 'premium', 'elite', 'subscription')
    $keywordsArray = "ARRAY['" + ($keywords -join "','") + "']"
    $tagsArray = "ARRAY['membership','pricing','features','subscription']"
    
    $articleCount++
    
    $sqlStatements += @"

-- Article $articleCount: $title
INSERT INTO knowledge_base (
    id, title, slug, content, excerpt, category, tier_level, 
    keywords, tags, author, status, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    '$title',
    '$slug',
    '$fullContent',
    '$excerpt',
    'real-estate-investing-101',
    'basic',
    $keywordsArray,
    $tagsArray,
    'System',
    'published',
    NOW(),
    NOW()
);

"@
    Write-Host "  ✓ Extracted: $title" -ForegroundColor Green
}

# Process foreclosure CRM setup
Write-Host "`n🏠 Processing foreclosure documentation..." -ForegroundColor Yellow

$foreclosureFile = Join-Path $SourceDir "foreclosure crm setup.txt"
if (Test-Path $foreclosureFile) {
    $content = Get-Content $foreclosureFile -Raw
    $title = "Foreclosure CRM Setup & Workflow Guide"
    $slug = "foreclosure-crm-setup-workflow"
    
    $excerpt = "Complete guide to setting up and using the foreclosure prevention CRM system, including SPIN questionnaire, lead tracking, and client management workflows."
    
    $fullContent = Sanitize-SQL $content
    $keywords = @('foreclosure', 'CRM', 'workflow', 'SPIN', 'questionnaire', 'leads', 'prevention', 'tracking')
    $keywordsArray = "ARRAY['" + ($keywords -join "','") + "']"
    $tagsArray = "ARRAY['foreclosure','crm','workflow','admin','premium']"
    
    $articleCount++
    
    $sqlStatements += @"

-- Article $articleCount: $title
INSERT INTO knowledge_base (
    id, title, slug, content, excerpt, category, tier_level, 
    keywords, tags, author, status, created_at, updated_at
) VALUES (
    gen_random_uuid(),
    '$title',
    '$slug',
    '$fullContent',
    '$excerpt',
    'pre-foreclosure-basics',
    'premium',
    $keywordsArray,
    $tagsArray,
    'System',
    'published',
    NOW(),
    NOW()
);

"@
    Write-Host "  ✓ Extracted: $title" -ForegroundColor Green
}

# Write output file
Write-Host "`n💾 Writing SQL file..." -ForegroundColor Yellow
Set-Content -Path $OutputFile -Value $sqlStatements
Write-Host "  ✓ Generated: $OutputFile" -ForegroundColor Green

Write-Host "`n════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ✅ EXTRACTION COMPLETE" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "  • Articles extracted: $articleCount" -ForegroundColor White
Write-Host "  • Output file: $OutputFile" -ForegroundColor White
Write-Host "`n📝 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review generated SQL file" -ForegroundColor White
Write-Host "  2. Run: psql -U postgres -d your_db -f $OutputFile" -ForegroundColor White
Write-Host "  3. Verify articles in knowledge_base table`n" -ForegroundColor White
