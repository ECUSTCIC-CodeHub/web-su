// Cloudflare Pages Function - 证书列表 API
// GET /api/certificates - 获取所有证书
// POST /api/certificates - 创建证书

export async function onRequestGet({ env }) {
  try {
    const result = await env.DEGREE_KV.list({ prefix: 'certificate:' });

    const certificates = [];
    if (result.keys && result.keys.length > 0) {
      const fetched = await Promise.all(
        result.keys.map(k => env.DEGREE_KV.get(k.name, { type: 'json' }))
      );
      certificates.push(...fetched.filter(Boolean));
    }

    certificates.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));

    return new Response(JSON.stringify({
      success: true,
      data: certificates,
      total: certificates.length
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

    const required = ['studentName', 'studentId', 'department', 'degreeType', 'research', 'thesis', 'supervisor'];
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

    const certificateId = `CIC-SU-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const certificate = {
      id: certificateId,
      applicationId: body.applicationId || '',
      studentName: body.studentName,
      studentNameRu: body.studentNameRu || body.studentName,
      studentId: body.studentId,
      department: body.department,
      degreeType: body.degreeType,
      degreeTypeRu: body.degreeTypeRu || body.degreeType,
      research: body.research,
      thesis: body.thesis,
      supervisor: body.supervisor,
      issueDate: body.issueDate || new Date().toISOString().split('T')[0],
      status: 'valid',
      verifyCode: `SOVIET-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    };

    await env.DEGREE_KV.put(`certificate:${certificateId}`, JSON.stringify(certificate));

    return new Response(JSON.stringify({
      success: true,
      data: certificate,
      message: '证书创建成功'
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
