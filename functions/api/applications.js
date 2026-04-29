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
      physics: '物理系',
      chemistry: '化学系',
      biology: '生物系',
      chinese: '中文系',
      foreign: '外语系',
      history: '历史系',
      philosophy: '哲学系',
      economics: '经济学系',
      management: '管理系',
      law: '法学系',
      social: '社会工作系',
      art: '艺术系',
      music: '音乐系',
      pe: '体育系',
      medicine: '医学系',
      architecture: '建筑系',
      energy: '能源与动力工程系',
      mechanical: '机械工程系',
      mechatronics: '机械电子工程系',
      manufacturing: '机械制造系',
      environment: '环境科学系',
      materials: '材料科学系',
      journalism: '新闻系',
      education: '教育系',
      psychology: '心理学系',
      geography: '地理系',
      astronomy: '天文系'
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
