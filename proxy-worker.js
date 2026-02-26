/**
 * Cloudflare Worker CORS Proxy
 * 
 * 部署步骤：
 * 1. 访问 https://workers.cloudflare.com/
 * 2. 注册/登录Cloudflare账号
 * 3. 创建新的Worker
 * 4. 复制此代码到Worker编辑器
 * 5. 保存并部署
 * 6. 复制Worker URL（如：https://your-proxy.your-subdomain.workers.dev）
 * 7. 更新api.ts中的CORS_PROXIES配置
 */

export default {
  async fetch(request, env, ctx) {
    // 处理CORS预检请求
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    // 获取目标URL
    const url = new URL(request.url);
    const targetUrl = url.searchParams.get('url');

    console.log('Proxy request:', targetUrl);

    if (!targetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 验证目标URL
    let targetDomain;
    try {
      targetDomain = new URL(targetUrl).hostname;
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL', url: targetUrl }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    console.log('Target domain:', targetDomain);

    // 转发请求
    try {
      console.log('Fetching:', targetUrl);
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

      console.log('Response status:', response.status);

      // 创建新的响应，添加CORS头
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Access-Control-Allow-Origin', '*');
      newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    } catch (error) {
      console.error('Proxy error:', error);
      return new Response(
        JSON.stringify({ error: 'Proxy error', message: error.message, url: targetUrl }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};
