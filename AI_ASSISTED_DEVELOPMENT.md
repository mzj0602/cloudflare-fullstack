# 🤖 配合 AI 工具完成项目指南

这份指南教你如何高效使用 AI 工具来完成整个项目。

---

## 🎯 AI 工具使用策略

### 1️⃣ **Claude (对话)**

**最佳用途:**
- 架构设计和规划
- 代码生成和重构
- 问题诊断和调试
- 文档编写

**示例对话:**

```
你: "帮我设计一个 tRPC 路由，实现文件上传功能"

Claude: [生成完整的 tRPC 代码，包括:
- 输入验证 (Zod schema)
- 文件处理逻辑
- 错误处理
- TypeScript 类型定义]
```

---

### 2️⃣ **Cursor / GitHub Copilot (编码)**

**最佳用途:**
- 实时代码补全
- 快速编写重复代码
- 测试用例生成
- 代码注释

**使用技巧:**

```typescript
// 在编辑器中输入注释，AI 自动生成代码:

// 创建一个函数，验证邮箱格式
// → AI 自动补全完整函数

// 为这个组件添加加载状态
// → AI 添加 isLoading state 和 UI
```

---

### 3️⃣ **ChatGPT (快速查询)**

**最佳用途:**
- 快速查文档
- 错误信息解释
- 命令行帮助
- 概念解释

**示例:**
```
你: "wrangler secret put 命令的所有选项"
ChatGPT: [列出所有选项和示例]
```

---

## 📋 任务分解 + AI 辅助流程

### **任务2: Pages CI/CD 部署 React + Vite**

#### AI 辅助步骤:

**Step 1: 让 Claude 生成项目结构**

```
提示词:
"创建一个 React + Vite + TypeScript + tRPC 项目，包括:
- package.json
- tsconfig.json
- vite.config.ts
- tRPC 客户端配置
- 基础组件结构"

→ Claude 生成所有文件
→ 你复制到项目中
```

**Step 2: 使用 Cursor 补全业务逻辑**

```
在 App.tsx 中:
// 创建一个聊天组件，包含输入框和消息列表
// → Cursor 自动生成完整组件

// 添加错误处理
// → Cursor 添加 try-catch 和 error state
```

**Step 3: 让 Claude 生成部署配置**

```
提示词:
"生成 Cloudflare Pages 的 wrangler.toml 配置文件，
包括环境变量和构建设置"

→ 复制配置
→ 根据你的项目调整
```

---

### **任务3: Workers + tRPC**

#### AI 辅助步骤:

**Step 1: Claude 生成 tRPC 路由骨架**

```
提示词:
"创建一个 tRPC 路由，包括:
- greeting 查询
- chat mutation (调用 AI API)
- 完整的 TypeScript 类型"

→ 得到完整的 src/trpc.ts
```

**Step 2: Cursor 补全 API 调用**

```typescript
// 在 callDeepSeek 函数中输入:
async function callDeepSeek(message: string, env: Env) {
  // 调用 DeepSeek API
  // → Cursor 自动补全 fetch 请求代码
}
```

**Step 3: Claude 调试 CORS 问题**

```
你: "我的 Worker 返回 CORS 错误，怎么修复?"

Claude: [提供完整的 CORS 配置代码]
```

---

### **任务4: AI API 集成**

#### AI 辅助步骤:

**Step 1: Claude 生成 API 包装函数**

```
提示词:
"生成一个函数，调用 DeepSeek API，包括:
- 完整的类型定义
- 错误处理
- 重试逻辑"
```

**Step 2: 使用 AI 优化提示词**

```
你: "帮我优化这个 AI 提示词，让回复更简洁"

Claude: [改进后的 system prompt]
```

---

### **任务5: MCP 集成**

#### AI 辅助步骤:

**Step 1: 让 Claude 解释 MCP 概念**

```
你: "详细解释 MCP 的工作原理和使用场景"

Claude: [完整的架构说明 + 示例代码]
```

**Step 2: Claude 生成 MCP 配置**

```
提示词:
"生成 Claude Desktop 的 MCP 配置，
集成 Filesystem 和 Brave Search"

→ 得到 claude_desktop_config.json
```

---

### **任务6: Cloudflare Tunnel**

#### AI 辅助步骤:

**Step 1: Claude 生成配置文件**

```
提示词:
"生成 cloudflared 的 config.yml，
包括多个子域名的路由配置"
```

**Step 2: 调试连接问题**

```
你: "Tunnel 显示 'connection refused'，怎么排查?"

Claude: [提供诊断步骤和解决方案]
```

---

## 💡 高效提示词模板

### 1. 代码生成

```
创建一个 [功能描述]，使用 [技术栈]，包括:
- [需求1]
- [需求2]
- [需求3]

要求:
- TypeScript
- 完整的错误处理
- 详细注释
```

### 2. 调试问题

```
我遇到了 [错误信息]

上下文:
- 项目: [技术栈]
- 代码: [相关代码片段]
- 已尝试: [已做的尝试]

请帮我诊断问题并提供解决方案。
```

### 3. 代码审查

```
请审查这段代码:
[代码]

关注点:
- 性能优化
- 安全问题
- 最佳实践
- TypeScript 类型安全
```

### 4. 文档生成

```
为这个函数/组件生成文档:
[代码]

包括:
- 功能说明
- 参数说明
- 返回值
- 使用示例
```

---

## 🚀 实战演练: 完整开发流程

### 场景: 添加用户认证功能

**Step 1: 规划 (Claude 对话)**

```
你: "我想在 Worker 中添加 JWT 认证，需要做什么?"

Claude: [提供完整架构:
- JWT 生成和验证
- 中间件设计
- 前端 token 存储
- tRPC 上下文扩展]
```

**Step 2: 生成代码 (Claude)**

```
你: "生成 JWT 认证的完整代码"

Claude: [生成:
- auth.ts (JWT 工具函数)
- middleware.ts (tRPC 中间件)
- login.ts (登录路由)
- protected.ts (受保护路由)]
```

**Step 3: 补全细节 (Cursor)**

```
在编辑器中:
// 添加密码哈希
// → Cursor 补全 bcrypt 代码

// 实现 token 刷新
// → Cursor 生成刷新逻辑
```

**Step 4: 前端集成 (Claude + Cursor)**

```
Claude 生成:
- useAuth hook
- ProtectedRoute 组件
- Login 表单组件

Cursor 补全:
- 表单验证
- 错误提示
- 加载状态
```

**Step 5: 测试 (ChatGPT 辅助)**

```
你: "写一个测试用例，测试 JWT 过期"

ChatGPT: [生成 Jest 测试代码]
```

---

## 🎯 AI 使用最佳实践

### ✅ DO (推荐)

1. **清晰的上下文**
   ```
   ❌ "帮我写代码"
   ✅ "在 React + TypeScript 项目中，创建一个带验证的表单组件"
   ```

2. **分步骤请求**
   ```
   ❌ "帮我完成整个项目"
   ✅ "先帮我设计数据结构，然后我们再实现 API"
   ```

3. **提供错误信息**
   ```
   ❌ "不工作"
   ✅ "返回 500 错误: TypeError: Cannot read property 'env' of undefined"
   ```

4. **验证 AI 输出**
   ```
   得到代码后:
   - 阅读理解
   - 运行测试
   - 检查类型
   - 逐步部署
   ```

### ❌ DON'T (避免)

1. **盲目复制代码**
   - 理解每一行的作用
   - 根据项目调整

2. **过度依赖**
   - 学习底层原理
   - 保持批判性思维

3. **忽略安全**
   - 审查 API 密钥处理
   - 检查输入验证

---

## 📚 推荐学习路径

### Week 1: 基础设施
- [ ] Cloudflare Pages 部署
- [ ] Workers 基础
- [ ] 域名和 DNS

**AI 辅助**: 让 Claude 解释每个概念

### Week 2: 全栈开发
- [ ] tRPC 集成
- [ ] 前后端通信
- [ ] 状态管理

**AI 辅助**: 使用 Cursor 加速编码

### Week 3: 高级功能
- [ ] AI API 集成
- [ ] MCP 服务
- [ ] Cloudflare Tunnel

**AI 辅助**: Claude 提供架构建议

### Week 4: 优化和扩展
- [ ] 性能优化
- [ ] 错误监控
- [ ] CI/CD 完善

**AI 辅助**: 代码审查和重构

---

## 🎓 学习资源

### 配合 AI 学习:

1. **遇到概念** → 问 Claude 详细解释
2. **看到代码** → 让 AI 逐行注释
3. **遇到错误** → 让 AI 诊断原因
4. **需要示例** → 让 AI 生成 demo

### 示例:

```
你: "解释 tRPC 的 createContext 是如何工作的"

Claude: [详细解释 + 代码示例 + 使用场景]
```

---

## ✅ 完成项目的 AI 辅助清单

- [ ] 使用 Claude 生成项目骨架
- [ ] 使用 Cursor 加速日常编码
- [ ] 遇到问题时咨询 AI
- [ ] 使用 AI 生成文档
- [ ] 让 AI 审查关键代码
- [ ] 用 AI 优化性能
- [ ] AI 辅助调试部署问题

---

**记住**: AI 是辅助工具，理解原理才是关键！

祝你项目顺利! 🚀
