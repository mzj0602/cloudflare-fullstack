# 🌐 Cloudflare Tunnel 配置指南

## 📋 任务6: 使用 Cloudflare Tunnel 访问 EC2 本地服务

Cloudflare Tunnel 让你安全地将 EC2 上的服务暴露到互联网，无需开放入站端口。

---

## 🎯 架构图

```
Internet
    ↓
Cloudflare Edge
    ↓
Cloudflare Tunnel (加密)
    ↓
EC2 Instance (无需公网IP)
    ↓
本地服务 (localhost:3000, localhost:8080, etc.)
```

**优势:**
- ✅ 无需配置防火墙或安全组
- ✅ 自动 HTTPS 和 SSL
- ✅ DDoS 保护
- ✅ 访问控制
- ✅ 免费使用

---

## 🚀 完整配置步骤

### Step 1: 在 EC2 上安装 cloudflared

**SSH 到你的 EC2:**
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

**安装 cloudflared (Ubuntu/Debian):**
```bash
# 下载最新版本
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# 安装
sudo dpkg -i cloudflared-linux-amd64.deb

# 验证安装
cloudflared --version
```

**其他系统:**
```bash
# Amazon Linux / CentOS
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.rpm
sudo rpm -i cloudflared-linux-amd64.rpm

# 手动安装 (通用)
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared
sudo chmod +x /usr/local/bin/cloudflared
```

---

### Step 2: 认证 Cloudflare

```bash
cloudflared tunnel login
```

**会发生什么:**
1. 打开浏览器窗口
2. 登录你的 Cloudflare 账号
3. 选择你的域名 (yourdomain.online)
4. 授权 cloudflared

**如果是无头服务器 (没有浏览器):**
```bash
# 在本地电脑运行
cloudflared tunnel login

# 会生成证书文件: ~/.cloudflared/cert.pem
# 复制这个文件到 EC2:
scp -i your-key.pem ~/.cloudflared/cert.pem ubuntu@your-ec2-ip:~/.cloudflared/
```

---

### Step 3: 创建 Tunnel

```bash
# 创建名为 my-ec2-tunnel 的 tunnel
cloudflared tunnel create my-ec2-tunnel
```

**输出示例:**
```
Tunnel credentials written to /home/ubuntu/.cloudflared/abc123-def456-ghi789.json
Created tunnel my-ec2-tunnel with id abc123-def456-ghi789
```

**记住这个 Tunnel ID**: `abc123-def456-ghi789`

---

### Step 4: 配置 Tunnel

**创建配置文件:**
```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

**基础配置 (单服务):**
```yaml
tunnel: abc123-def456-ghi789  # 替换为你的 Tunnel ID
credentials-file: /home/ubuntu/.cloudflared/abc123-def456-ghi789.json

ingress:
  # 主应用 (例如 Express API)
  - hostname: ec2.yourdomain.online
    service: http://localhost:3000
  
  # 默认规则 (必需)
  - service: http_status:404
```

**多服务配置 (推荐):**
```yaml
tunnel: abc123-def456-ghi789
credentials-file: /home/ubuntu/.cloudflared/abc123-def456-ghi789.json

ingress:
  # API 服务
  - hostname: api.ec2.yourdomain.online
    service: http://localhost:3000
  
  # Web 应用
  - hostname: app.ec2.yourdomain.online
    service: http://localhost:8080
  
  # MCP 服务器
  - hostname: mcp.ec2.yourdomain.online
    service: http://localhost:5000
  
  # WebSocket 支持
  - hostname: ws.ec2.yourdomain.online
    service: http://localhost:4000
    originRequest:
      noTLSVerify: true
  
  # 默认规则
  - service: http_status:404
```

**保存并退出** (`Ctrl+X`, `Y`, `Enter`)

---

### Step 5: 配置 DNS

```bash
# 为每个 hostname 创建 DNS 记录
cloudflared tunnel route dns my-ec2-tunnel ec2.yourdomain.online
cloudflared tunnel route dns my-ec2-tunnel api.ec2.yourdomain.online
cloudflared tunnel route dns my-ec2-tunnel app.ec2.yourdomain.online
cloudflared tunnel route dns my-ec2-tunnel mcp.ec2.yourdomain.online
```

**或者手动在 Cloudflare Dashboard 添加:**
```
Type: CNAME
Name: ec2
Target: abc123-def456-ghi789.cfargotunnel.com
Proxy status: Proxied (橙色云朵)
```

---

### Step 6: 启动 Tunnel

**前台测试运行:**
```bash
cloudflared tunnel run my-ec2-tunnel
```

**看到类似输出表示成功:**
```
INF Starting tunnel tunnelID=abc123-def456-ghi789
INF Connection registered connIndex=0
INF Connection registered connIndex=1
INF Connection registered connIndex=2
INF Connection registered connIndex=3
```

**测试访问:**
```bash
# 在另一个终端或浏览器
curl https://ec2.yourdomain.online
```

---

### Step 7: 配置为系统服务 (后台运行)

**安装为服务:**
```bash
sudo cloudflared service install
```

**启动服务:**
```bash
sudo systemctl start cloudflared
sudo systemctl enable cloudflared  # 开机自启
```

**查看状态:**
```bash
sudo systemctl status cloudflared
```

**查看日志:**
```bash
sudo journalctl -u cloudflared -f
```

**重启服务:**
```bash
sudo systemctl restart cloudflared
```

---

## 🔧 在 EC2 上部署示例服务

### 示例1: 简单的 Express API

```bash
# 安装 Node.js (如果还没有)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 创建测试应用
mkdir ~/my-api
cd ~/my-api
npm init -y
npm install express

# 创建 API
cat > index.js << 'EOF'
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ 
    message: 'Hello from EC2!',
    timestamp: new Date().toISOString(),
    server: 'Express on EC2'
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(3000, () => {
  console.log('API running on port 3000');
});
EOF

# 运行 (使用 PM2 保持后台运行)
npm install -g pm2
pm2 start index.js --name my-api
pm2 save
pm2 startup  # 开机自启
```

**访问测试:**
```bash
curl https://ec2.yourdomain.online
```

---

### 示例2: MCP 服务器

```bash
# 安装 MCP 服务器
npm install -g @modelcontextprotocol/server-filesystem

# 创建 MCP 包装服务
mkdir ~/mcp-server
cd ~/mcp-server
npm init -y
npm install express @modelcontextprotocol/server-filesystem

cat > server.js << 'EOF'
const express = require('express');
const { spawn } = require('child_process');
const app = express();

app.use(express.json());

app.post('/mcp', async (req, res) => {
  // 处理 MCP 请求
  const mcp = spawn('npx', [
    '-y',
    '@modelcontextprotocol/server-filesystem',
    '/home/ubuntu'
  ]);
  
  let output = '';
  mcp.stdout.on('data', (data) => {
    output += data.toString();
  });
  
  mcp.on('close', () => {
    res.json({ result: output });
  });
  
  mcp.stdin.write(JSON.stringify(req.body));
  mcp.stdin.end();
});

app.listen(5000, () => {
  console.log('MCP server on port 5000');
});
EOF

pm2 start server.js --name mcp-server
```

---

## 🔗 从 Worker 访问 EC2 服务

更新 Worker 的 tRPC 路由:

```typescript
// worker/src/trpc.ts

export const appRouter = t.router({
  // ... 其他路由
  
  // 调用 EC2 服务
  ec2Data: t.procedure
    .query(async () => {
      const response = await fetch('https://api.ec2.yourdomain.online/data');
      const data = await response.json();
      return data;
    }),
  
  // 健康检查
  ec2Health: t.procedure
    .query(async () => {
      try {
        const response = await fetch('https://ec2.yourdomain.online/health');
        const data = await response.json();
        return { status: 'connected', data };
      } catch (error) {
        return { 
          status: 'disconnected', 
          error: error instanceof Error ? error.message : 'Unknown error' 
        };
      }
    }),
});
```

**前端调用:**
```typescript
// 在 React 组件中
function EC2Status() {
  const { data, isLoading } = trpc.ec2Health.useQuery();
  
  return (
    <div>
      {isLoading ? 'Checking...' : data?.status}
    </div>
  );
}
```

---

## 🛡️ 安全和访问控制

### 启用访问控制 (可选)

**1. 添加基础认证:**
```yaml
ingress:
  - hostname: ec2.yourdomain.online
    service: http://localhost:3000
    originRequest:
      httpHostHeader: ec2.yourdomain.online
      access:
        required: true
        teamName: your-team-name
        audTag: your-aud-tag
```

**2. IP 白名单 (在 Cloudflare Dashboard):**
```
Cloudflare Dashboard
→ Security → WAF
→ Create Rule
→ 只允许特定 IP 访问
```

---

## 📊 监控和日志

### 查看 Tunnel 指标

**Cloudflare Dashboard:**
```
Zero Trust → Access → Tunnels → my-ec2-tunnel
→ 查看连接状态、流量、错误
```

**本地日志:**
```bash
# 查看实时日志
sudo journalctl -u cloudflared -f

# 查看错误
sudo journalctl -u cloudflared -p err

# 最近100行
sudo journalctl -u cloudflared -n 100
```

---

## ⚠️ 故障排除

### 问题1: Tunnel 无法启动

```bash
# 检查配置文件
cat ~/.cloudflared/config.yml

# 检查证书
ls -la ~/.cloudflared/

# 重新认证
cloudflared tunnel login
```

### 问题2: 服务无法访问

```bash
# 检查本地服务是否运行
curl http://localhost:3000

# 检查 Tunnel 状态
sudo systemctl status cloudflared

# 重启 Tunnel
sudo systemctl restart cloudflared
```

### 问题3: DNS 未生效

```bash
# 检查 DNS 记录
nslookup ec2.yourdomain.online

# 手动添加 DNS (Cloudflare Dashboard)
Type: CNAME
Name: ec2
Target: <tunnel-id>.cfargotunnel.com
```

---

## ✅ 验证完成

**测试清单:**

```bash
# 1. Tunnel 运行正常
sudo systemctl status cloudflared

# 2. DNS 解析正确
nslookup ec2.yourdomain.online

# 3. HTTPS 访问成功
curl https://ec2.yourdomain.online

# 4. Worker 能访问 EC2
# 在浏览器访问你的应用，测试 EC2 集成功能
```

---

## 🎯 完整架构

```
用户浏览器
    ↓
https://yourdomain.online (Cloudflare Pages - React App)
    ↓
https://api.yourdomain.online/trpc (Cloudflare Workers)
    ↓ (调用 AI)
DeepSeek/OpenAI API
    ↓ (调用 EC2)
https://ec2.yourdomain.online (Cloudflare Tunnel)
    ↓
EC2 Instance (localhost:3000)
    ↓
本地服务 / MCP 服务器
```

---

## 🎉 恭喜！

你已完成所有6个任务:

✅ 任务1: 购买域名并部署到 Cloudflare
✅ 任务2: Pages CI/CD 部署 React + Vite
✅ 任务3: Workers + tRPC 连接前端
✅ 任务4: Workers 请求 DeepSeek/OpenAI
✅ 任务5: 集成 MCP 服务
✅ 任务6: Cloudflare Tunnel 访问 EC2

**最终成果:**
- 🌐 全栈应用: https://yourdomain.online
- 🔧 API 服务: https://api.yourdomain.online
- 🖥️ EC2 服务: https://ec2.yourdomain.online
- 🤖 AI 集成: DeepSeek/OpenAI
- 🔌 MCP 工具: Filesystem + Brave Search
- 📦 GitHub 仓库: 完整代码

**下一步建议:**
- 添加数据库 (Cloudflare D1)
- 添加认证 (Cloudflare Access)
- 添加分析 (Cloudflare Analytics)
- 优化性能 (Cloudflare Cache)
