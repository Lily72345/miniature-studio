// Supabase Edge Function: 代理 Resend 邮件发送
// 部署后需要在 Supabase Dashboard → Edge Functions → Settings 设置环境变量:
//   RESEND_API_KEY=re_xxx（你的新 Resend API Key）

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;

serve(async (req) => {
  // 校验来源（可选，确保只有你的网站能调用）
  const origin = req.headers.get("origin") || "";
  const allowedOrigins = [
    "https://miniaturebois.com",
    "https://lily72345.github.io",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
  ];
  if (origin && !allowedOrigins.includes(origin)) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  const payload = await req.json();

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const result = await res.json();
  return new Response(JSON.stringify(result), {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin || "*",
      "Access-Control-Allow-Headers": "authorization, content-type",
    },
  });
});
