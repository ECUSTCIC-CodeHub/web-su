// 学位申请 API - 使用 KV 存储
// GET /api/applications - 获取所有申请
// POST /api/applications - 创建新申请

export async function onRequestGet(context) {
  try {
    // 获取所有申请
    const result = await degree_kv.list({ prefix: 'application:' });
    
    const applications = [];
    if (result.keys && result.keys.length > 0) {
      const fetched = await Promise.all(
        result.keys.map(k => degree_kv.get(k.key, { type: 'json' }))
      );
      applications.push(...fetched.filter(Boolean));
    }

    // 按提交时间倒序排列
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

export async function onRequestPost(context) {
  try {
    const body = await context.request.json();
    
    // 验证必填字段
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

    // 生成申请ID
    const applicationId = `APP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    // 学位类型中文映射
    const degreeMap = {
      bachelor: '学士',
      master: '硕士',
      phd: '博士'
    };

    // 部门中文映射
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
      status: 'pending', // pending, reviewing, approved, rejected
      statusLabel: '审核中',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      reviewComments: '',
      reviewedBy: '',
      reviewedAt: null
    };

    // 保存到 KV
    await degree_kv.put(`application:${applicationId}`, JSON.stringify(application));

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
