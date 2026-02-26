# 自建CORS代理服务器部署指南

## 方案：Cloudflare Worker（推荐）

Cloudflare Worker是免费的边缘计算服务，每天10万次请求，足够个人使用。

### 部署步骤

#### 1. 注册Cloudflare账号
- 访问 https://workers.cloudflare.com/
- 点击 "Sign Up" 注册账号
- 验证邮箱

#### 2. 创建Worker
1. 登录Cloudflare Dashboard
2. 点击左侧菜单 "Workers & Pages"
3. 点击 "Create application"
4. 选择 "Create Worker"
5. 给Worker起个名字（如：`situation-monitor-proxy`）

#### 3. 部署代码
1. 在Worker编辑器中，删除默认代码
2. 复制 `proxy-worker.js` 文件中的全部代码
3. 粘贴到编辑器中
4. 点击 "Save and deploy"

#### 4. 获取Worker URL
- 部署成功后，你会得到一个URL，如：
  ```
  https://situation-monitor-proxy.your-username.workers.dev
  ```

#### 5. 更新网站配置
1. 打开 `src/lib/config/api.ts`
2. 修改 `CORS_PROXIES` 配置：
   ```typescript
   export const CORS_PROXIES = {
     primary: 'https://situation-monitor-proxy.your-username.workers.dev/?url=',
     fallback: 'https://corsproxy.io/?url=',
     backup: 'https://api.codetabs.com/v1/proxy?quest='
   } as const;
   ```
3. 提交并推送代码

#### 6. 等待部署
- GitHub Actions会自动重新部署网站
- 约2-3分钟后刷新网页测试

---

## 备选方案：Vercel Edge Function

如果你已经在使用Vercel，可以使用Edge Function作为代理。

### 部署步骤

#### 1. 创建Vercel项目
```bash
# 安装Vercel CLI
npm i -g vercel

# 登录
vercel login
```

#### 2. 创建代理代码
创建 `api/proxy.js` 文件：

```javascript
export default async function handler(request) {
  const url = new URL(request.url);
  const targetUrl = url.searchParams.get('url');

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const response = await fetch(targetUrl);
    const data = await response.text();
    
    return new Response(data, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
```

#### 3. 部署
```bash
vercel --prod
```

#### 4. 获取URL并更新配置
部署后会得到类似 `https://your-project.vercel.app/api/proxy?url=` 的URL

---

## 验证代理是否工作

部署完成后，可以测试代理：

```bash
# 测试GDELT API
curl "https://your-proxy.workers.dev/?url=https://api.gdeltproject.org/api/v2/doc/doc?query=politics&format=json"

# 应该返回JSON数据
```

---

## 注意事项

1. **免费额度**：
   - Cloudflare Worker：每天10万次请求
   - Vercel：每月100GB带宽

2. **安全性**：
   - 代理代码中有域名白名单，只允许访问特定API
   - 防止被滥用访问其他网站

3. **性能**：
   - Cloudflare Worker全球有边缘节点，速度快
   - 支持缓存，可以进一步提升性能

4. **调试**：
   - 在Worker控制台可以查看实时日志
   - 方便排查问题
