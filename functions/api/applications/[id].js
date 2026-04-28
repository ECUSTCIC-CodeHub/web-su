// Cloudflare Pages Function - 单个学位申请 API
// GET /api/applications/:id - 获取申请详情
// PUT /api/applications/:id - 更新申请状态（审批）
// DELETE /api/applications/:id - 删除申请

export async function onRequestGet({ params, env }) {
  try {
    const applicationId = params.id;

    const application = await env.DEGREE_KV.get(`application:${applicationId}`, { type: 'json' });

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

export async function onRequestPut({ params, request, env }) {
  try {
    const applicationId = params.id;
    const body = await request.json();

    const existing = await env.DEGREE_KV.get(`application:${applicationId}`, { type: 'json' });

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: '申请不存在'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const statusLabels = {
      pending: '审核中',
      reviewing: '委员会评审中',
      approved: '已批准',
      rejected: '未通过'
    };

    const updated = {
      ...existing,
      status: body.status || existing.status,
      statusLabel: statusLabels[body.status] || existing.statusLabel,
      reviewComments: body.reviewComments !== undefined ? body.reviewComments : existing.reviewComments,
      reviewedBy: body.reviewedBy || existing.reviewedBy,
      reviewedAt: body.status && body.status !== existing.status ? new Date().toISOString() : existing.reviewedAt,
      updatedAt: new Date().toISOString()
    };

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
        verifyCode: `SOVIET-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
      };

      await env.DEGREE_KV.put(`certificate:${certificateId}`, JSON.stringify(certificate));
      updated.certificateId = certificateId;
    }

    await env.DEGREE_KV.put(`application:${applicationId}`, JSON.stringify(updated));

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

export async function onRequestDelete({ params, env }) {
  try {
    const applicationId = params.id;

    const existing = await env.DEGREE_KV.get(`application:${applicationId}`, { type: 'json' });

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: '申请不存在'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    await env.DEGREE_KV.delete(`application:${applicationId}`);

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
