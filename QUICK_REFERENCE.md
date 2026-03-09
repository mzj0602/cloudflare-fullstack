# ⚡ 快速命令参考

常用命令速查表，快速复制粘贴使用。

---

## 🚀 项目初始化

### 克隆和安装
```bash
git clone https://github.com/你的用户名/cloudflare-fullstack.git
cd cloudflare-fullstack

# 安装前端依赖
cd frontend
npm install

# 安装 Worker 依赖
cd ../worker
npm install
```

---

## 🔧 本地开发

### 启动前端
```bash
cd frontend
npm run dev
# http://localhost:3000
```

### 启动 Worker
```bash
cd worker

# 创建本地环境变量
cat > .dev.vars << EOF
DEEPSEEK_API_KEY=sk-your-key
OPENAI_API_KEY=sk-your-key
EOF

npm run dev
# http://localhost:8787
```

---

## 🌐 部署命令

### 部署 Worker
```bash
cd worker

# 登录 Cloudflare
npx wrangler login

# 添加生产密钥
npx wrangler secret put DEEPSEEK_API_KEY
npx wrangler secret put OPENAI_API_KEY

# 部署
npm run deploy
```

### 部署前端 (通过 Git)
```bash
cd frontend
git add .
git commit -m "Update frontend"
git push
# Cloudflare Pages 自动部署
```

### 手动部署前端
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=your-project
```

---

## 🔐 密钥管理

### 查看已设置的密钥
```bash
cd worker
npx wrangler secret list
```

### 删除密钥
```bash
npx wrangler secret delete DEEPSEEK_API_KEY
```

### 更新密钥
```bash
npx wrangler secret put DEEPSEEK_API_KEY
# 输入新的密钥
```

---

## 🌐 Cloudflare Tunnel

### 基础命令
```bash
# 登录
cloudflared tunnel login

# 创建 Tunnel
cloudflared tunnel create my-tunnel

# 列出所有 Tunnel
cloudflared tunnel list

# 删除 Tunnel
cloudflared tunnel delete my-tunnel

# 运行 Tunnel
cloudflared tunnel run my-tunnel
```

### DNS 路由
```bash
# 添加 DNS 记录
cloudflared tunnel route dns my-tunnel subdomain.yourdomain.com

# 查看路由
cloudflared tunnel route ip show

# 删除路由
cloudflared tunnel route ip delete <route-id>
```

### 系统服务
```bash
# 安装服务
sudo cloudflared service install

# 启动
sudo systemctl start cloudflared

# 停止
sudo systemctl stop cloudflared

# 重启
sudo systemctl restart cloudflared

# 查看状态
sudo systemctl status cloudflared

# 查看日志
sudo journalctl -u cloudflared -f

# 开机自启
sudo systemctl enable cloudflared
```

---

## 🔍 调试命令

### 检查 DNS
```bash
# 检查域名解析
nslookup yourdomain.online

# 详细查询
dig yourdomain.online

# 检查 CNAME
dig CNAME subdomain.yourdomain.online
```

### 测试 API
```bash
# Worker 健康检查
curl https://your-worker.workers.dev/health

# tRPC 测试
curl -X POST https://your-worker.workers.dev/trpc/greeting \
  -H "Content-Type: application/json" \
  -d '{"name":"World"}'

# EC2 测试
curl https://ec2.yourdomain.online/health
```

### 查看日志
```bash
# Worker 日志
npx wrangler tail

# 实时日志
npx wrangler tail --format pretty

# Cloudflared 日志
sudo journalctl -u cloudflared -f
```

---

## 🔄 Git 工作流

### 基础流程
```bash
# 查看状态
git status

# 添加文件
git add .

# 提交
git commit -m "描述改动"

# 推送
git push

# 拉取
git pull
```

### 分支管理
```bash
# 创建分支
git checkout -b feature/new-feature

# 切换分支
git checkout main

# 合并分支
git merge feature/new-feature

# 删除分支
git branch -d feature/new-feature
```

---

## 📦 依赖管理

### 添加依赖
```bash
# 前端
cd frontend
npm install package-name

# Worker
cd worker
npm install package-name
```

### 更新依赖
```bash
# 检查过期包
npm outdated

# 更新所有
npm update

# 更新特定包
npm update package-name
```

---

## 🧹 清理命令

### 清理缓存
```bash
# npm 缓存
npm cache clean --force

# Wrangler 缓存
rm -rf .wrangler

# Node modules
rm -rf node_modules
npm install
```

### 清理构建
```bash
# 前端
cd frontend
rm -rf dist

# Worker
cd worker
rm -rf dist
```

---

## 🔧 常见问题修复

### Worker 部署失败
```bash
# 检查登录
npx wrangler whoami

# 重新登录
npx wrangler logout
npx wrangler login

# 检查配置
cat wrangler.toml
```

### CORS 错误
```bash
# 测试 CORS
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -X OPTIONS \
  https://your-worker.workers.dev/trpc
```

### 域名未生效
```bash
# 清除 DNS 缓存 (Mac)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# 清除 DNS 缓存 (Linux)
sudo systemd-resolve --flush-caches

# 清除 DNS 缓存 (Windows)
ipconfig /flushdns
```

---

## 📊 监控命令

### Worker 性能
```bash
# 查看分析
npx wrangler analytics

# 详细指标
npx wrangler analytics --help
```

### 检查健康状态
```bash
# Worker
curl https://your-worker.workers.dev/health

# EC2 (通过 Tunnel)
curl https://ec2.yourdomain.online/health

# 全部检查
curl https://your-worker.workers.dev/health && \
curl https://ec2.yourdomain.online/health && \
echo "All services healthy"
```

---

## 🚀 一键部署脚本

### 创建部署脚本
```bash
cat > deploy.sh << 'EOF'
#!/bin/bash

echo "🚀 Deploying Cloudflare Full Stack App..."

# Worker
echo "📦 Deploying Worker..."
cd worker
npm run deploy

# Frontend
echo "🎨 Building Frontend..."
cd ../frontend
npm run build

echo "✅ Deployment complete!"
echo "🌐 Visit: https://yourdomain.online"
EOF

chmod +x deploy.sh
```

### 使用
```bash
./deploy.sh
```

---

## 🔐 环境变量快速设置

### 前端 (.env)
```bash
cat > frontend/.env << EOF
VITE_WORKER_URL=https://your-worker.workers.dev
VITE_MASTRA_URL=https://your-mastra-agent.workers.dev
EOF
```

### Worker (.dev.vars)
```bash
cat > worker/.dev.vars << EOF
DEEPSEEK_API_KEY=sk-your-deepseek-key
OPENAI_API_KEY=sk-your-openai-key
EOF
```

---

## 📝 快速测试

### 测试整个流程
```bash
# 1. Worker 健康检查
curl https://your-worker.workers.dev/health

# 2. tRPC greeting
curl -X POST https://your-worker.workers.dev/trpc/greeting \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}'

# 3. 前端访问
open https://yourdomain.online

# 4. EC2 连接
curl https://ec2.yourdomain.online/health
```

---

## 🆘 紧急恢复

### 回滚 Worker
```bash
# 查看部署历史
npx wrangler deployments list

# 回滚到上一个版本
npx wrangler rollback
```

### 回滚前端
```bash
# 在 Cloudflare Dashboard
# Workers & Pages → 你的项目 → Deployments
# 点击之前的部署 → Rollback
```

---

## 📋 检查清单

### 部署前检查
```bash
# ✅ 代码已提交
git status

# ✅ 依赖已安装
npm list

# ✅ 环境变量已设置
cat .env
cat .dev.vars

# ✅ 构建成功
npm run build

# ✅ 测试通过
npm test
```

---

**提示**: 收藏这个页面，随时查阅常用命令！
