// 单个证书 API
// GET /api/certificates/:id - 获取证书详情
// PUT /api/certificates/:id - 更新证书
// DELETE /api/certificates/:id - 删除证书

export async function onRequestGet(context) {
  try {
    const { params } = context;
    const certificateId = params.id;
    
    const certificate = await degree_kv.get(`certificate:${certificateId}`, { type: 'json' });
    
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

export async function onRequestPut(context) {
  try {
    const { params, request } = context;
    const certificateId = params.id;
    const body = await request.json();
    
    const existing = await degree_kv.get(`certificate:${certificateId}`, { type: 'json' });
    
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
      id: certificateId, // 保持ID不变
      updatedAt: new Date().toISOString()
    };

    await degree_kv.put(`certificate:${certificateId}`, JSON.stringify(updated));

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

export async function onRequestDelete(context) {
  try {
    const { params } = context;
    const certificateId = params.id;
    
const existing = await degree_kv.get(`certificate:${certificateId}`, { type: 'json' });

    if (!existing) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '证书不存在' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await degree_kv.delete(`certificate:${certificateId}`);

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
