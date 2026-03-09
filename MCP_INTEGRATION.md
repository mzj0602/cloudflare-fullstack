# 🔌 MCP 服务集成指南

Model Context Protocol (MCP) 让 AI 应用能够连接外部工具和数据源。

## 📋 任务5: 选择实用的 MCP 服务

### 推荐的 MCP 服务

#### 1️⃣ **Filesystem MCP** (推荐 ⭐⭐⭐⭐⭐)

**用途**: 让 AI 读写本地文件系统

**实际应用场景:**
- 📝 自动整理下载文件夹
- 📊 批量处理数据文件
- 🔍 搜索和分析日志
- 📁 自动归档和备份

**安装:**
```bash
npm install -g @modelcontextprotocol/server-filesystem
```

**配置 (Claude Desktop):**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/你的用户名/Documents",
        "/Users/你的用户名/Downloads"
      ]
    }
  }
}
```

**使用示例:**
```
你: "帮我把下载文件夹里所有的PDF整理到Documents/PDFs文件夹"
AI: [使用 Filesystem MCP 自动移动文件]

你: "分析我的日志文件，找出所有错误"
AI: [读取日志，提取错误信息]
```

---

#### 2️⃣ **Brave Search MCP** (推荐 ⭐⭐⭐⭐)

**用途**: 让 AI 实时搜索网络

**实际应用场景:**
- 🔍 获取最新新闻
- 📈 查询实时数据 (股票、天气等)
- 🎯 研究特定话题
- ✅ 事实核查

**安装:**
```bash
npm install -g @modelcontextprotocol/server-brave-search
```

**获取 API Key:**
```
1. 访问 https://brave.com/search/api/
2. 注册账号
3. 创建 API Key (免费 2000 次/月)
```

**配置:**
```json
{
  "mcpServers": {
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-brave-api-key"
      }
    }
  }
}
```

**使用示例:**
```
你: "最新的 AI 新闻有哪些?"
AI: [使用 Brave Search 搜索最新新闻]

你: "比较 React 19 和 Vue 3 的性能"
AI: [搜索最新基准测试和文档]
```

---

#### 3️⃣ **SQLite MCP** (新奇 ⭐⭐⭐⭐)

**用途**: 让 AI 查询和管理 SQLite 数据库

**实际应用场景:**
- 📊 数据分析和报表
- 🔍 自然语言查询数据库
- 🛠️ 数据清洗和迁移
- 📈 生成数据可视化

**安装:**
```bash
npm install -g @modelcontextprotocol/server-sqlite
```

**配置:**
```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sqlite",
        "/path/to/your/database.db"
      ]
    }
  }
}
```

**使用示例:**
```
你: "显示销售额最高的10个产品"
AI: SELECT product_name, SUM(sales) FROM ... ORDER BY ... LIMIT 10

你: "创建一个报表显示每月收入趋势"
AI: [查询数据 + 生成可视化]
```

---

#### 4️⃣ **Puppeteer MCP** (新奇 ⭐⭐⭐⭐⭐)

**用途**: 让 AI 控制浏览器自动化操作

**实际应用场景:**
- 🤖 自动化网页测试
- 📸 批量截图
- 📊 爬取数据
- ✅ 自动化表单填写

**安装:**
```bash
npm install -g @modelcontextprotocol/server-puppeteer
```

**配置:**
```json
{
  "mcpServers": {
    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"]
    }
  }
}
```

**使用示例:**
```
你: "打开GitHub并截图我的个人资料页"
AI: [自动打开浏览器，导航，截图]

你: "自动填写这个表单"
AI: [识别表单字段，自动填写]
```

---

#### 5️⃣ **Memory MCP** (实用 ⭐⭐⭐⭐)

**用途**: 让 AI 跨会话记住信息

**实际应用场景:**
- 📝 记住用户偏好
- 🎯 个性化响应
- 📊 跟踪长期项目
- 🔄 上下文持久化

**安装:**
```bash
npm install -g @modelcontextprotocol/server-memory
```

**配置:**
```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"]
    }
  }
}
```

---

## 🚀 快速开始: 集成 MCP 到你的项目

### 场景1: 在 Claude Desktop 使用 MCP

**Step 1: 安装 Claude Desktop**
```
下载: https://claude.ai/download
```

**Step 2: 配置 MCP 服务器**

文件位置:
- Mac: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/你的用户名/Documents"
      ]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-api-key"
      }
    }
  }
}
```

**Step 3: 重启 Claude Desktop**

**Step 4: 测试**
```
你: "列出我Documents文件夹里的所有PDF文件"
Claude: [使用 Filesystem MCP 读取目录]
```

---

### 场景2: 在 Worker 中使用 MCP (高级)

由于 MCP 服务器通常运行在本地，需要通过 Cloudflare Tunnel 暴露。

**架构:**
```
Worker → Cloudflare Tunnel → 本地 MCP 服务器
```

**实现步骤见 CLOUDFLARE_TUNNEL.md**

---

## 🎯 我的推荐配置

### 对于你的学习项目:

**配置1: 本地开发助手**
```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "."]
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your-key"
      }
    }
  }
}
```

**用途:**
- 让 AI 帮你管理项目文件
- 实时搜索文档和教程
- 自动生成代码

---

**配置2: 数据分析工作流**
```json
{
  "mcpServers": {
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "./data.db"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./data"]
    }
  }
}
```

**用途:**
- 自然语言查询数据库
- 自动生成报表
- 数据清洗和转换

---

## 📊 MCP 服务对比

| MCP 服务 | 实用性 | 新奇度 | 学习价值 | 推荐度 |
|---------|-------|-------|---------|--------|
| Filesystem | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Brave Search | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| SQLite | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Puppeteer | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Memory | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐ |

---

## 🔗 更多 MCP 服务

浏览更多官方和社区 MCP 服务:
- https://github.com/modelcontextprotocol/servers
- https://mcp.so (MCP 服务市场)

---

## ✅ 完成任务5

选择并配置 1-2 个 MCP 服务:

**推荐组合:**
1. ✅ Filesystem MCP (必选 - 最实用)
2. ✅ Brave Search MCP (推荐 - 扩展能力)

**或者如果你想尝试新奇的:**
1. ✅ Filesystem MCP
2. ✅ Puppeteer MCP (浏览器自动化)

下一步: **任务6 - Cloudflare Tunnel 访问 EC2**
