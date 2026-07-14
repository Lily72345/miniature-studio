# 部署 Supabase Edge Function（Resend 邮件代理）

## 为什么要做这个

GitHub 扫描到你仓库里的 `RESEND_API_KEY` 硬编码，这是安全漏洞。

修复方案：API Key 不再写在前端代码里，而是存在 Supabase Edge Function 的环境变量中。

前端调用 Edge Function → Edge Function 用服务端 API Key 调 Resend。

---

## 第一步：吊销旧 Resend API Key（2 分钟）

1. 登录 https://resend.com/api-keys
2. 找到 key `re_U1ngw5m5_H2oHam9iw4SnHqG64BRCU9AH`，点击删除/Revoke
3. 点击 Create API Key，起个名字如 "miniature-studio-edge"
4. **复制新的 API Key（只显示一次！）**，备用

---

## 第二步：部署 Edge Function（3 分钟）

1. 登录你的 Supabase Dashboard：https://supabase.com → 选项目 `pbllylagxbyllgwdvtkl`
2. 左侧菜单 → **Edge Functions** → 点击 **Create a new function**
3. Function name 填：`send-order-email`
4. 把 `supabase/functions/send-order-email/index.ts` 的内容粘贴进去
5. 点击 **Create function**

### 设置环境变量

6. 在新创建的函数页面，找到 **Settings** 标签
7. 在 Environment Variables 里添加：
   - Key: `RESEND_API_KEY`
   - Value: `re_xxxxx`（你在第一步复制的新 API Key）
8. 点击 **Save**（或 **Apply changes**）

9. 回到函数详情页，点击 **Deploy** 完成部署

### 验证

部署成功后，函数的 URL 是：
```
https://pbllylagxbyllgwdvtkl.supabase.co/functions/v1/send-order-email
```

---

## 第三步：Push 代码到 GitHub（现在）

`index.html` 已经改好了（删除了硬编码的 `RESEND_API_KEY`），直接 push：

```bash
git add index.html
git commit -m "fix: 移除硬编码 RESEND_API_KEY，改用 Supabase Edge Function 代理"
git push
```

---

## 验证是否生效

1. 在网站上做一个测试支付（PayPal sandbox 或其他方式）
2. 检查是否收到订单邮件
3. 打开浏览器 Console，应该看到 Edge Function 的请求，而不是直接请求 `api.resend.com`

---

## 问题排查

| 问题 | 可能原因 | 解决 |
|---|---|---|
| 函数返回 403 | CORS origin 不匹配 | 在 Edge Function 代码的 `allowedOrigins` 里加你的域名 |
| 函数返回 500 | 环境变量未设置 | 检查 RESEND_API_KEY 是否正确添加到 Settings |
| 函数返回 401 | Supabase anon key 不对 | 确认 frontend 用的是正确的 SUPABASE_KEY |

---

## 以后迁移到自建后端

这个方案的架构非常灵活，以后你自建后端时：

```
Edge Function 代理 → 自建后端代理
                      ↓
只需改前端 URL 一处代码，其他不变
```
