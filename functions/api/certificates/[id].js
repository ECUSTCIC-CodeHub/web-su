// Cloudflare Pages Function - 单个证书 API
// GET /api/certificates/:id - 获取证书详情
// PUT /api/certificates/:id - 更新证书
// DELETE /api/certificates/:id - 删除证书

export async function onRequestGet({ params, env }) {
  try {
    const certificateId = params.id;

    const certificate = await env.DEGREE_KV.get(`certificate:${certificateId}`, { type: 'json' });

    if (!certificate) {
      return new Response(JSON.stringify({
        success: false,
        error: '证书不存在'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: certificate
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestPut({ params, request, env }) {
  try {
    const certificateId = params.id;
    const body = await request.json();

    const existing = await env.DEGREE_KV.get(`certificate:${certificateId}`, { type: 'json' });

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: '证书不存在'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const updated = {
      ...existing,
      ...body,
      id: certificateId,
      updatedAt: new Date().toISOString()
    };

    await env.DEGREE_KV.put(`certificate:${certificateId}`, JSON.stringify(updated));

    return new Response(JSON.stringify({
      success: true,
      data: updated,
      message: '证书更新成功'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function onRequestDelete({ params, env }) {
  try {
    const certificateId = params.id;

    const existing = await env.DEGREE_KV.get(`certificate:${certificateId}`, { type: 'json' });

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: '证书不存在'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.DEGREE_KV.delete(`certificate:${certificateId}`);

    return new Response(JSON.stringify({
      success: true,
      message: '证书已删除'
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
