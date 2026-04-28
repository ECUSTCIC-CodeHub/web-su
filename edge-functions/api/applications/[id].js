// 单个学位申请 API
// GET /api/applications/:id - 获取申请详情
// PUT /api/applications/:id - 更新申请状态（审批）
// DELETE /api/applications/:id - 删除申请

export async function onRequestGet(context) {
  try {
    const { params } = context;
    const applicationId = params.id;
    
    const application = await degree_kv.get(`application:${applicationId}`, { type: 'json' });
    
    if (!application) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '申请不存在' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: application 
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
    const applicationId = params.id;
    const body = await request.json();
    
    // 获取现有申请
    const existing = await degree_kv.get(`application:${applicationId}`, { type: 'json' });
    
    if (!existing) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '申请不存在' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // 状态映射
    const statusLabels = {
      pending: '审核中',
      reviewing: '委员会评审中',
      approved: '已批准',
      rejected: '未通过'
    };

    // 更新申请
    const updated = {
      ...existing,
      status: body.status || existing.status,
      statusLabel: statusLabels[body.status] || existing.statusLabel,
      reviewComments: body.reviewComments !== undefined ? body.reviewComments : existing.reviewComments,
      reviewedBy: body.reviewedBy || existing.reviewedBy,
      reviewedAt: body.status && body.status !== existing.status ? new Date().toISOString() : existing.reviewedAt,
      updatedAt: new Date().toISOString()
    };

    // 如果批准了，自动生成证书
    if (body.status === 'approved' && existing.status !== 'approved') {
      const certificateId = `CIC-SU-${new Date().getFullYear()}-${applicationId.split('-').pop()}`;
      const certificate = {
        id: certificateId,
        applicationId: applicationId,
        studentName: existing.nameCn,
        studentNameRu: existing.nameRu,
        studentId: existing.studentId,
        department: existing.departmentLabel,
        degreeType: existing.degreeTypeLabel,
        degreeTypeRu: existing.degreeType === 'bachelor' ? 'Бакалавр' : existing.degreeType === 'master' ? 'Магистр' : 'Доктор',
        research: existing.research,
        thesis: existing.thesis,
        supervisor: existing.supervisor,
        issueDate: new Date().toISOString().split('T')[0],
        status: 'valid',
        verifyCode: `SOVIET-${Math.random().toString(36).substr(2, 8).toUpperCase()}`
      };
      
      await degree_kv.put(`certificate:${certificateId}`, JSON.stringify(certificate));
      updated.certificateId = certificateId;
    }

    await degree_kv.put(`application:${applicationId}`, JSON.stringify(updated));

    return new Response(JSON.stringify({ 
      success: true, 
      data: updated,
      message: '申请更新成功'
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
    const applicationId = params.id;
    
const existing = await degree_kv.get(`application:${applicationId}`, { type: 'json' });

    if (!existing) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '申请不存在' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await degree_kv.delete(`application:${applicationId}`);

    return new Response(JSON.stringify({ 
      success: true, 
      message: '申请已删除'
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
