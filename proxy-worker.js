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

// 允许访问的API域名白名单
const ALLOWED_DOMAINS = [
  'api.gdeltproject.org',      // GDELT新闻API
  'finnhub.io',                // Finnhub金融API
  'api.stlouisfed.org',        // FRED美联储API
  'api.coingecko.com',         // CoinGecko加密货币API
];

// 允许的请求来源（你的GitHub Pages域名）
const ALLOWED_ORIGINS = [
  'https://jwang287.github.io',
  'http://localhost:5173',     // 本地开发
  'http://localhost:4173',     // 本地预览
];

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

    // 验证目标域名
    let targetDomain;
    try {
      targetDomain = new URL(targetUrl).hostname;
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 检查域名白名单
    const isAllowed = ALLOWED_DOMAINS.some(domain => 
      targetDomain === domain || targetDomain.endsWith('.' + domain)
    );

    if (!isAllowed) {
      return new Response(
        JSON.stringify({ error: 'Domain not allowed', domain: targetDomain }),
        {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // 转发请求
    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      });

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
      return new Response(
        JSON.stringify({ error: 'Proxy error', message: error.message }),
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
