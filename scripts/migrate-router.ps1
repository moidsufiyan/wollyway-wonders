$srcPath = "src"
$files = Get-ChildItem -Path $srcPath -Recurse -Include "*.tsx","*.ts" | Where-Object {
    (Get-Content $_.FullName -Raw) -match "react-router-dom"
}

$count = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw

    # 1. Pure "import { Link } from '...'"  -> "import Link from 'next/link'"
    $content = $content -replace "import \{ Link \} from 'react-router-dom';", "import Link from 'next/link';"
    $content = $content -replace 'import \{ Link \} from "react-router-dom";', 'import Link from "next/link";'

    # 2. Mixed imports like "import { Link, useNavigate } from ..."
    #    These need manual handling — just flag them for now by leaving react-router-dom
    #    (they will be caught in the targeted per-file pass)

    # 3. Pure "import { useLocation } from '...'" -> "import { usePathname } from 'next/navigation'"
    $content = $content -replace "import \{ useLocation \} from 'react-router-dom';", "import { usePathname } from 'next/navigation';"
    $content = $content -replace 'import \{ useLocation \} from "react-router-dom";', 'import { usePathname } from "next/navigation";'

    # 4. Pure "import { useNavigate } from '...'" -> "import { useRouter } from 'next/navigation'"
    $content = $content -replace "import \{ useNavigate \} from 'react-router-dom';", "import { useRouter } from 'next/navigation';"
    $content = $content -replace 'import \{ useNavigate \} from "react-router-dom";', 'import { useRouter } from "next/navigation";'

    # 5. useLocation() call -> usePathname()
    $content = $content -replace 'const location = useLocation\(\);', 'const pathname = usePathname();'
    $content = $content -replace 'location\.pathname', 'pathname'

    # 6. useNavigate() -> useRouter()
    $content = $content -replace 'const navigate = useNavigate\(\);', 'const router = useRouter();'

    # 7. navigate( -> router.push(  (be careful with navigate(-1) etc)
    $content = $content -replace 'navigate\(-1\)', 'router.back()'
    $content = $content -replace "navigate\('([^']+)'\)", "router.push('`$1')"
    $content = $content -replace 'navigate\("([^"]+)"\)', 'router.push("$1")'

    Set-Content -Path $file.FullName -Value $content -NoNewline
    $count++
    Write-Host "Updated: $($file.Name)"
}
Write-Host "Done. $count files processed."
