# MCP Server Complete Setup Guide

## 現在の状況（2025-07-25 再起動前）

### 設定済みの9つのMCPサーバー（すべて接続失敗中）
```
1. playwright: npx -y @modelcontextprotocol/server-playwright - ✗ Failed to connect
2. filesystem: npx -y @modelcontextprotocol/server-filesystem C:/Users/tsail/Desktop C:/Users/tsail/Documents C:/Users/tsail/Downloads - ✗ Failed to connect
3. puppeteer: npx -y @modelcontextprotocol/server-puppeteer - ✗ Failed to connect
4. sequential-thinking: npx -y mcp-sequentialthinking-tools - ✗ Failed to connect
5. omnisearch: npx -y mcp-omnisearch - ✗ Failed to connect
6. memory: npx -y @modelcontextprotocol/server-memory - ✗ Failed to connect
7. fetch: npx -y @modelcontextprotocol/server-fetch - ✗ Failed to connect
8. sqlite: npx -y @modelcontextprotocol/server-sqlite C:/Users/tsail/databases - ✗ Failed to connect
9. github: npx -y @modelcontextprotocol/server-github - ✗ Failed to connect
```

## 問題の原因と解決策

### 存在しないパッケージ（要修正）
- `@modelcontextprotocol/server-playwright` → `@playwright/mcp`
- `@modelcontextprotocol/server-puppeteer` → `@hisma/server-puppeteer`
- `@modelcontextprotocol/server-fetch` → 存在しない（WebFetchツール使用推奨）
- `@modelcontextprotocol/server-sqlite` → `mcp-sqlite`
- `@modelcontextprotocol/server-github` → 要確認

### インストール済みパッケージ
```bash
# 既にインストール済み
@modelcontextprotocol/server-filesystem
@modelcontextprotocol/server-memory
@modelcontextprotocol/server-sequential-thinking
@hisma/server-puppeteer
@playwright/mcp
mcp-omnisearch
mcp-sequentialthinking-tools
```

## 再起動後の復旧手順

### Step 1: MCPサーバー一覧確認
```bash
claude mcp list
```

### Step 2: 接続失敗したサーバーを削除
```bash
claude mcp remove playwright
claude mcp remove puppeteer
claude mcp remove fetch
claude mcp remove sqlite
claude mcp remove github
```

### Step 3: 正しいパッケージ名でサーバーを追加
```bash
# Playwright
claude mcp add playwright "npx -y @playwright/mcp"

# Puppeteer
claude mcp add puppeteer "npx -y @hisma/server-puppeteer"

# SQLite
claude mcp add sqlite "npx -y mcp-sqlite" "C:/Users/tsail/databases"

# GitHub（パッケージ名要確認）
# claude mcp add github "npx -y [正しいパッケージ名]"
```

### Step 4: 接続確認
```bash
claude mcp list
```

## 重要な注意事項

### 前回の問題
- Claude Code再起動後にMCPサーバー設定が消失
- インストールしたパッケージが認識されなくなる

### 対策
1. **設定の永続化**: プロジェクト固有の`.mcp.json`ファイルの利用を検討
2. **パッケージの確認**: 再起動後は`npm list -g`でグローバルパッケージを確認
3. **段階的な設定**: 一度に全部ではなく、1つずつサーバーを追加して動作確認

## 次回作業時の手順

### 1. 現状確認
```bash
claude mcp list
npm list -g | findstr modelcontextprotocol
npm list -g | findstr mcp
```

### 2. 不足パッケージのインストール
```bash
# 必要に応じて
npm install -g [パッケージ名]
```

### 3. サーバー設定の修正
- 存在しないパッケージを削除
- 正しいパッケージ名で再追加

### 4. 動作確認
各サーバーが正常に接続できることを確認

## 補足情報

### 利用可能な代替ツール
- **fetch機能**: Claude CodeのWebFetchツールが既に利用可能
- **GitHub機能**: 要パッケージ確認

### プロジェクト固有設定
MCPサーバー専用プロジェクトでは`.mcp.json`ファイルでプロジェクト固有の設定を管理することを検討。

---
作成日: 2025-07-25
最終更新: Claude Code再起動前

