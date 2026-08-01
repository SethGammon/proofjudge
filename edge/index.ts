/// <reference types="@cloudflare/workers-types" />

const ALLOWED_METHODS = new Set(["GET", "HEAD", "POST"]);
const MAX_REQUEST_BYTES = 1_048_576;

function jsonResponse(body: unknown, status: number): Response {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "content-security-policy": "default-src 'none'; frame-ancestors 'none'",
      "x-content-type-options": "nosniff"
    }
  });
}

export default {
  async fetch(request, env): Promise<Response> {
    const requestUrl = new URL(request.url);
    if (requestUrl.pathname === "/edge-healthz") {
      return jsonResponse({ ok: true, service: "proofjudge-edge", origin: "eigencompute" }, 200);
    }

    if (!ALLOWED_METHODS.has(request.method)) {
      return jsonResponse({ error: "Method not allowed" }, 405);
    }

    const declaredLength = Number(request.headers.get("content-length") || 0);
    if (declaredLength > MAX_REQUEST_BYTES) {
      return jsonResponse({ error: "Request body too large" }, 413);
    }

    const upstreamUrl = new URL(requestUrl.pathname + requestUrl.search, env.ORIGIN_BASE_URL);
    const headers = new Headers(request.headers);
    headers.delete("cf-connecting-ip");
    headers.delete("cf-ipcountry");
    headers.delete("host");
    headers.delete("x-forwarded-for");
    headers.set("x-proofjudge-edge", "cloudflare-worker");

    try {
      const upstream = await fetch(upstreamUrl, {
        method: request.method,
        headers,
        body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
        redirect: "manual",
        signal: AbortSignal.timeout(110_000)
      });
      const responseHeaders = new Headers(upstream.headers);
      responseHeaders.set("x-proofjudge-edge", "cloudflare-worker");
      responseHeaders.set("x-content-type-options", "nosniff");
      if (requestUrl.pathname.startsWith("/api/")) responseHeaders.set("cache-control", "no-store");

      console.log(JSON.stringify({
        event: "proxy_response",
        method: request.method,
        path: requestUrl.pathname,
        status: upstream.status
      }));

      return new Response(upstream.body, {
        status: upstream.status,
        statusText: upstream.statusText,
        headers: responseHeaders
      });
    } catch (error) {
      console.error(JSON.stringify({
        event: "origin_unavailable",
        method: request.method,
        path: requestUrl.pathname,
        error: error instanceof Error ? error.name : "UnknownError"
      }));
      return jsonResponse({
        error: "The ProofJudge EigenCompute origin is temporarily unavailable.",
        retryable: true
      }, 503);
    }
  }
} satisfies ExportedHandler<Env>;
