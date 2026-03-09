# 🚀 完整部署指南

## 📋 准备工作

### 1. 必需的账号和工具

- ✅ GitHub 账号
- ✅ Cloudflare 账号 (免费)
- ✅ DeepSeek API Key (可选，推荐) 或 OpenAI API Key
- ✅ 域名 (已购买: yourdomain.online)
- ✅ Git
- ✅ Node.js 18+

### 2. 获取 API Keys

**DeepSeek (推荐 - 便宜):**
```
1. 访问 https://platform.deepseek.com
2. 注册/登录
3. 创建 API Key
4. 复制保存: sk-xxxxxxxx
```

**OpenAI (可选):**
```
1. 访问 https://platform.openai.com
2. 注册/登录
3. 创建 API Key
4. 复制保存: sk-xxxxxxxx
```

---

## 🎯 部署步骤

### Step 1: 推送代码到 GitHub

```bash
cd /path/to/cloudflare-fullstack

# 初始化 Git
git init
git add .
git commit -m "Initial commit: Cloudflare full stack app"

# 创建 GitHub 仓库
gh repo create cloudflare-fullstack --public --source=. --remote=origin --push

# 或手动方式:
# 1. 在 GitHub 创建新仓库
# 2. git remote add origin https://github.com/你的用户名/cloudflare-fullstack.git
# 3. git branch -M main
# 4. git push -u origin main
```

---

### Step 2: 部署 Worker

```bash
cd worker

# 登录 Cloudflare
npx wrangler login

# 创建本地开发环境变量 (可选)
cat > .dev.vars << EOF
DEEPSEEK_API_KEY=sk-your-deepseek-key
OPENAI_API_KEY=sk-your-openai-key
EOF

# 添加生产环境密钥
npx wrangler secret put DEEPSEEK_API_KEY
# 输入你的 DeepSeek API Key

npx wrangler secret put OPENAI_API_KEY
# 输入你的 OpenAI API Key (可选)

# 部署 Worker
npm run deploy

# 记录 Worker URL，例如:
# https://cloudflare-worker.your-subdomain.workers.dev
```

---

### Step 3: 部署前端到 Cloudflare Pages

#### 方法1: 通过 Cloudflare Dashboard (推荐)

1. **访问 Cloudflare Pages**
   ```
   https://dash.cloudflare.com
   → Workers & Pages
   → Create application
   → Pages
   → Connect to Git
   ```

2. **连接 GitHub**
   ```
   授权 Cloudflare 访问 GitHub
   选择仓库: cloudflare-fullstack
   点击 "Begin setup"
   ```

3. **配置构建**
   ```
   Project name: cloudflare-app (或任意名字)
   Production branch: main
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: frontend
   ```

4. **添加环境变量**
   ```
   Variable name: VITE_WORKER_URL
   Value: https://cloudflare-worker.your-subdomain.workers.dev
   
   点击 "Save and Deploy"
   ```

5. **等待部署完成**
   ```
   通常 1-3 分钟
   部署成功后会得到 URL:
   https://cloudflare-app.pages.dev
   ```

#### 方法2: 通过 Wrangler CLI

```bash
cd frontend

# 构建项目
npm run build

# 部署到 Pages
npx wrangler pages deploy dist --project-name=cloudflare-app
```

---

### Step 4: 绑定自定义域名

1. **在 Pages 项目中绑定域名**
   ```
   Cloudflare Dashboard
   → Workers & Pages
   → 你的 Pages 项目
   → Custom domains
   → Set up a custom domain
   → 输入: yourdomain.online
   → Continue
   ```

2. **Cloudflare 自动配置 DNS**
   ```
   自动添加 CNAME 记录:
   yourdomain.online → cloudflare-app.pages.dev
   
   等待 SSL 证书生成 (1-5分钟)
   ```

3. **为 Worker 添加自定义域名 (可选)**
   ```
   Workers → 你的 Worker → Settings → Triggers
   → Add Custom Domain
   → 输入: api.yourdomain.online
   → Add Custom Domain
   ```

---

### Step 5: 更新前端 Worker URL

**如果使用了自定义域名:**

```bash
# 在 Cloudflare Pages 环境变量中更新
VITE_WORKER_URL=https://api.yourdomain.online

# 或者如果 Worker 也在 Pages
VITE_WORKER_URL=https://cloudflare-worker.your-subdomain.workers.dev
```

**重新部署前端:**
```bash
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

### Step 6: 验证部署

1. **访问你的网站**
   ```
   https://yourdomain.online
   或
   https://cloudflare-app.pages.dev
   ```

2. **测试 AI 聊天**
   ```
   在聊天框输入: "Hello, AI!"
   应该收到 AI 回复
   ```

3. **检查 Worker**
   ```
   访问: https://api.yourdomain.online/health
   应该返回:
   {
     "status": "ok",
     "timestamp": "...",
     "worker": "cloudflare-worker"
   }
   ```

---

## 🔧 配置 CI/CD

每次推送代码到 GitHub，Cloudflare Pages 会自动：

1. ✅ 拉取最新代码
2. ✅ 运行 `npm run build`
3. ✅ 部署到 Pages
4. ✅ 更新网站

**Worker 自动部署 (可选):**

创建 `.github/workflows/deploy-worker.yml`:

```yaml
name: Deploy Worker

on:
  push:
    branches: [main]
    paths:
      - 'worker/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - name: Deploy Worker
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
        run: |
          cd worker
          npm install
          npx wrangler deploy
```

---

## 🎯 下一步: MCP 集成

继续 **任务5**: 集成 MCP 服务

推荐的 MCP 服务:
- Filesystem MCP (文件操作)
- Brave Search MCP (网络搜索)
- Google Drive MCP (云存储)

详见下一份文档...

---

## ⚠️ 故障排除

### 问题1: Worker 部署失败
```bash
# 检查 wrangler 登录状态
npx wrangler whoami

# 重新登录
npx wrangler login
```

### 问题2: 前端无法连接 Worker
```bash
# 检查 CORS 配置
# 确保 Worker 返回正确的 CORS 头
# 检查环境变量 VITE_WORKER_URL 是否正确
```

### 问题3: AI API 调用失败
```bash
# 检查 API Key 是否正确设置
npx wrangler secret list

# 重新设置
npx wrangler secret put DEEPSEEK_API_KEY
```

### 问题4: 域名无法访问
```bash
# 检查 DNS 传播
nslookup yourdomain.online

# 等待 15-30 分钟
# 清除浏览器缓存
```

---

## 📊 成本估算

| 服务 | 免费额度 | 超出后价格 |
|------|---------|-----------|
| Cloudflare Pages | 无限请求 | 免费 |
| Cloudflare Workers | 100,000 请求/天 | $0.50/百万请求 |
| DeepSeek API | - | ~$0.14/百万tokens |
| OpenAI API | - | ~$0.50/百万tokens |
| 域名 | - | $1-15/年 |

**预计月费用**: $0-5 (取决于使用量)

---

## 🎉 完成！

现在你有了一个完整的全栈应用:

✅ 域名: yourdomain.online
✅ 前端: React + Vite (Cloudflare Pages)
✅ 后端: Workers + tRPC
✅ AI 集成: DeepSeek/OpenAI
✅ CI/CD: 自动部署

**GitHub 链接**: https://github.com/你的用户名/cloudflare-fullstack
**网站链接**: https://yourdomain.online
