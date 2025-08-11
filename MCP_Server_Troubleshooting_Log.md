# MCP Server Troubleshooting Log

## 記録日時
2025-07-25 - Claude Code再起動前の状況

## 現在のMCPサーバー設定状況

### 設定されているサーバー一覧（すべて接続失敗）
1. **playwright**: `npx -y @modelcontextprotocol/server-playwright` - ✗ Failed to connect
2. **filesystem**: `npx -y @modelcontextprotocol/server-filesystem C:/Users/tsail/Desktop C:/Users/tsail/Documents C:/Users/tsail/Downloads` - ✗ Failed to connect
3. **puppeteer**: `npx -y @modelcontextprotocol/server-puppeteer` - ✗ Failed to connect
4. **sequential-thinking**: `npx -y mcp-sequentialthinking-tools` - ✗ Failed to connect
5. **omnisearch**: `npx -y mcp-omnisearch` - ✗ Failed to connect
6. **memory**: `npx -y @modelcontextprotocol/server-memory` - ✗ Failed to connect
7. **fetch**: `npx -y @modelcontextprotocol/server-fetch` - ✗ Failed to connect
8. **sqlite**: `npx -y @modelcontextprotocol/server-sqlite C:/Users/tsail/databases` - ✗ Failed to connect
9. **github**: `npx -y @modelcontextprotocol/server-github` - ✗ Failed to connect

### インストール済みパッケージ
以下のパッケージがグローバルにインストール済み：
- `@modelcontextprotocol/server-filesystem`
- `@modelcontextprotocol/server-memory`
- `@modelcontextprotocol/server-sequential-thinking`
- `@hisma/server-puppeteer`
- `@playwright/mcp`
- `mcp-omnisearch`
- `mcp-sequentialthinking-tools`

### 判明した問題
1. **存在しないパッケージ**:
   - `@modelcontextprotocol/server-fetch` (404 Not Found)
   - `@modelcontextprotocol/server-playwright` (正確なパッケージ名は `@playwright/mcp`)
   - `@modelcontextprotocol/server-puppeteer` (正確なパッケージ名は `@hisma/server-puppeteer`)
   - `@modelcontextprotocol/server-sqlite` (代替: `mcp-sqlite`)
   - `@modelcontextprotocol/server-github` (要確認)

2. **パッケージ名の不一致**: 設定で指定されているパッケージ名と実際に存在するパッケージ名が異なる

### 前回の経験による問題
- Claude Code再起動後にMCPサーバー設定が消失する現象が発生
- インストールしたパッケージも認識されなくなる

### 次回実行すべき対策
1. 正しいパッケージ名でMCPサーバーを再設定
2. 設定の永続化方法を確認
3. プロジェクト固有の設定ファイル（.mcp.json）の利用を検討

### 正しいパッケージ名のマッピング
- playwright: `@playwright/mcp` → `npx -y @playwright/mcp`
- puppeteer: `@hisma/server-puppeteer` → `npx -y @hisma/server-puppeteer`
- sqlite: `mcp-sqlite` → `npx -y mcp-sqlite`
- fetch: 代替手段を検討（WebFetchツールが既に利用可能）

## Claude Code再起動実行予定
この記録後、Claude Code再起動を実行し、設定の保持状況を確認する。