// Cloudflare Pages Function - 证书验证 API
// GET /api/verify?code=xxx - 通过验证码验证证书
// GET /api/verify?id=xxx - 通过证书ID验证

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const certId = url.searchParams.get('id');

    if (!code && !certId) {
      return new Response(JSON.stringify({
        success: false,
        error: '请提供证书编号或验证码'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    let certificate = null;

    if (certId) {
      certificate = await env.DEGREE_KV.get(`certificate:${certId}`, { type: 'json' });
    }

    if (!certificate && code) {
      const result = await env.DEGREE_KV.list({ prefix: 'certificate:' });

      if (result.keys && result.keys.length > 0) {
        const fetched = await Promise.all(
          result.keys.map(k => env.DEGREE_KV.get(k.name, { type: 'json' }))
        );
        certificate = fetched.find(cert => cert && cert.verifyCode === code);
      }
    }

    if (!certificate) {
      return new Response(JSON.stringify({
        success: true,
        valid: false,
        message: '证书无效！未找到匹配的证书记录。'
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (certificate.status !== 'valid') {
      return new Response(JSON.stringify({
        success: true,
        valid: false,
        message: '证书已被撤销或失效。',
        data: {
          id: certificate.id,
          studentName: certificate.studentName,
          status: certificate.status
        }
      }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      valid: true,
      message: '证书有效！该证书由CIC苏联分部学位委员会正式颁发。',
      data: {
        id: certificate.id,
        studentName: certificate.studentName,
        studentNameRu: certificate.studentNameRu,
        studentId: certificate.studentId,
        department: certificate.department,
        degreeType: certificate.degreeType,
        degreeTypeRu: certificate.degreeTypeRu,
        research: certificate.research,
        thesis: certificate.thesis,
        supervisor: certificate.supervisor,
        issueDate: certificate.issueDate
      }
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
