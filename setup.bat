@echo off
chcp 65001 > nul

echo.
echo ==========================================
echo 🎉 RepoTomo セットアップ (Windows)
echo ==========================================
echo.

REM 1. 依存関係のインストール
echo 📦 依存関係をインストール中...
call npm install
if errorlevel 1 (
    echo ❌ npm install に失敗しました。Node.jsがインストールされているか確認してください。
    pause
    exit /b 1
)

REM 2. 環境変数ファイルのコピー
echo.
echo 🔧 環境変数を設定中...

if exist ".env.local" (
    echo ⚠️  .env.local が既に存在します。バックアップを作成します...
    copy ".env.local" ".env.local.backup" > nul
)

copy ".env.example" ".env.local" > nul
if errorlevel 1 (
    echo ❌ 環境変数ファイルの作成に失敗しました
    pause
    exit /b 1
) else (
    echo ✅ 環境変数ファイル (.env.local) を作成しました
)

REM 3. プロジェクト構造の確認
echo.
echo 📁 プロジェクト構造を確認中...

if exist "src" if exist "supabase" (
    echo ✅ プロジェクト構造が正常です
) else (
    echo ❌ プロジェクト構造に問題があります
    pause
    exit /b 1
)

REM 4. ビルドテスト
echo.
echo 🔨 ビルドテストを実行中...
call npm run build
if errorlevel 1 (
    echo ❌ ビルドテストに失敗しました
    pause
    exit /b 1
) else (
    echo ✅ ビルドテストが成功しました
)

REM 5. セットアップ完了
echo.
echo 🎉 セットアップが完了しました！
echo.
echo 次のコマンドで開発サーバーを起動できます：
echo   npm run dev
echo.
echo 管理画面URL: http://localhost:3000/admin/dashboard
echo 管理者パスワード: 123456
echo.
echo 🚀 Happy Coding!
echo.
pause