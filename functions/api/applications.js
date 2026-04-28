// Cloudflare Pages Function - 学位申请 API
// GET /api/applications - 获取所有申请
// POST /api/applications - 创建新申请

export async function onRequestGet({ env }) {
  try {
    const result = await env.DEGREE_KV.list({ prefix: 'application:' });

    const applications = [];
    if (result.keys && result.keys.length > 0) {
      const fetched = await Promise.all(
        result.keys.map(k => env.DEGREE_KV.get(k.name, { type: 'json' }))
      );
      applications.push(...fetched.filter(Boolean));
    }

    applications.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

    return new Response(JSON.stringify({
      success: true,
      data: applications,
      total: applications.length
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

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();

    const required = ['nameCn', 'nameRu', 'studentId', 'department', 'degreeType', 'research', 'thesis', 'supervisor'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(JSON.stringify({
          success: false,
          error: `缺少必填字段: ${field}`
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const degreeMap = {
      bachelor: '学士',
      master: '硕士',
      phd: '博士'
    };

    const deptMap = {
      cs: '计算机科学系',
      ee: '电子工程系',
      math: '数学系',
      physics: '物理系'
    };

    const application = {
      id: applicationId,
      ...body,
      degreeTypeLabel: degreeMap[body.degreeType] || body.degreeType,
      departmentLabel: deptMap[body.department] || body.department,
      status: 'pending',
      statusLabel: '审核中',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewComments: '',
      reviewedBy: '',
      reviewedAt: null
    };

    await env.DEGREE_KV.put(`application:${applicationId}`, JSON.stringify(application));

    return new Response(JSON.stringify({
      success: true,
      data: application,
      message: '申请提交成功'
    }), {
      status: 201,
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
