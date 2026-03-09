# Cloudflare Full Stack Application

完整的 Cloudflare 生态全栈应用，包含 React 前端、Workers 后端、tRPC API 和 AI 集成。

## 📁 项目结构

```
cloudflare-fullstack/
├── frontend/          # React + Vite + tRPC 客户端
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   └── types/
│   └── package.json
├── worker/            # Cloudflare Workers + tRPC 服务端
│   ├── src/
│   │   ├── index.ts   # Worker 入口
│   │   └── trpc.ts    # tRPC 路由定义
│   └── wrangler.toml
├── mastra-agent/      # Mastra 实验目录（当前非生产部署链路）
└── README.md
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 前端
cd frontend
npm install

# Worker
cd ../worker
npm install
```

### 2. 配置环境变量

**Worker (.dev.vars 文件):**
```bash
cd worker
cat > .dev.vars << EOF
DEEPSEEK_API_KEY=your_deepseek_key_here
OPENAI_API_KEY=your_openai_key_here
EOF
```

### 3. 本地开发

**启动 Worker (终端1):**
```bash
cd worker
npm run dev
# Worker 运行在 http://localhost:8787
```

**启动前端 (终端2):**
```bash
cd frontend
npm run dev
# 前端运行在 http://localhost:3000
```

### 4. 部署到生产环境

**部署 Worker:**
```bash
cd worker

# 添加生产环境密钥
npx wrangler secret put DEEPSEEK_API_KEY
npx wrangler secret put OPENAI_API_KEY

# 部署
npm run deploy
```

**部署前端到 Cloudflare Pages:**

1. 推送代码到 GitHub
2. 在 Cloudflare Dashboard 连接仓库
3. 配置构建:
   - Build command: `npm run build`
   - Build directory: `dist`
   - Root directory: `frontend`
4. 添加环境变量:
   - `VITE_WORKER_URL`: 你的 Worker URL


## 🔧 技术栈

- **前端**: React 18 + TypeScript + Vite
- **API**: tRPC + Zod
- **后端**: Cloudflare Workers
- **AI**: DeepSeek API / OpenAI API
- **部署**: Cloudflare Pages + Workers
- **类型安全**: TypeScript 全栈类型推导

## 🌐 API 端点

### tRPC 路由

- `greeting.query({ name: string })` - 问候接口
- `chat.mutation({ message: string, provider?: 'deepseek' | 'openai' })` - AI 聊天
- `ec2Health.query()` - EC2 健康检查 (需要 Cloudflare Tunnel)

### REST 端点

- `GET /health` - Worker 健康检查
- `POST /trpc/*` - tRPC 批量请求

## 📝 环境变量

### Frontend (.env)
```
VITE_WORKER_URL=https://your-worker.workers.dev
```

### Worker (Secrets)
```
DEEPSEEK_API_KEY=sk-...
OPENAI_API_KEY=sk-...
```

## 🔗 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [tRPC 文档](https://trpc.io/)
- [DeepSeek API](https://platform.deepseek.com/)

## ⚠️ Mastra 说明

- `mastra-agent/` 目录当前作为实验/学习用途保留。
- 当前生产天气链路使用 `worker/`（tRPC）实现。
- 在 Cloudflare Workers 免费档（3 MiB 脚本限制）下，Mastra 构建产物通常会超限，无法直接发布。

## 📄 License

MIT
