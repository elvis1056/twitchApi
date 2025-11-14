/**
* Cloudflare Worker - Twitch API Proxy
* 用於代理前端對 Twitch API 的請求，隱藏敏感的 API credentials
*/

export default {
  async fetch(request, env, ctx) {
    // 處理 CORS preflight 請求
    if (request.method === 'OPTIONS') {
      return handleCORS();
    }

    try {
      // 解析請求的 URL 和查詢參數
      const url = new URL(request.url);

      // 只處理 /api/streams 路徑
      if (url.pathname === '/api/streams') {
        return await handleStreamsRequest(url, env);
      }

      // 其他路徑返回 404
      return new Response('Not Found', { status: 404 });

    } catch (error) {
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: corsHeaders()
      });
    }
  }
};

/**
* 處理 /api/streams 請求
*/
async function handleStreamsRequest(url, env) {
  // 1. 獲取 access token（從快取或重新獲取）
  let accessToken = await env.TWITCH_TOKEN_CACHE.get('access_token');

  if (!accessToken) {
    console.log('Token not found in cache, fetching new token...');
    accessToken = await getNewAccessToken(env);

    // 儲存到 KV，設定 30 天過期
    await env.TWITCH_TOKEN_CACHE.put('access_token', accessToken, {
      expirationTtl: 60 * 60 * 24 * 30  // 30 天
    });
  }

  // 2. 構建 Twitch API 請求 URL（保留原始查詢參數）
  const twitchApiUrl = `https://api.twitch.tv/helix/streams${url.search}`;

  // 3. 向 Twitch API 發送請求
  const twitchResponse = await fetch(twitchApiUrl, {
    method: 'GET',
    headers: {
      'Client-ID': env.TWITCH_CLIENT_ID,
      'Authorization': `Bearer ${accessToken}`
    }
  });

  // 4. 處理 Twitch API 的錯誤回應
  if (!twitchResponse.ok) {
    // 如果是 401（token 過期），清除快取並重試一次
    if (twitchResponse.status === 401) {
      console.log('Token expired, fetching new token...');
      await env.TWITCH_TOKEN_CACHE.delete('access_token');

      // 重新獲取 token 並重試
      accessToken = await getNewAccessToken(env);
      await env.TWITCH_TOKEN_CACHE.put('access_token', accessToken, {
        expirationTtl: 60 * 60 * 24 * 30
      });

      // 重新請求 Twitch API
      const retryResponse = await fetch(twitchApiUrl, {
        method: 'GET',
        headers: {
          'Client-ID': env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const retryData = await retryResponse.json();
      return new Response(JSON.stringify(retryData), {
        status: retryResponse.status,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders()
        }
      });
    }

    // 其他錯誤直接返回
    const errorData = await twitchResponse.json();
    return new Response(JSON.stringify(errorData), {
      status: twitchResponse.status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders()
      }
    });
  }

  // 5. 返回成功的回應
  const data = await twitchResponse.json();
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  });
}

/**
* 從 Twitch OAuth 獲取新的 access token
*/
async function getNewAccessToken(env) {
  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: env.TWITCH_CLIENT_ID,
      client_secret: env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });

  if (!response.ok) {
    throw new Error(`Failed to get access token: ${response.status}`);
  }

  const data = await response.json();
  console.log(`New token acquired, expires in ${data.expires_in} seconds`);

  return data.access_token;
}

/**
* CORS headers
*/
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}

/**
* 處理 CORS preflight 請求
*/
function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}