// Cloudflare Pages Function - 统计数据 API
// GET /api/stats - 获取学位系统统计数据

export async function onRequestGet({ env }) {
  try {
    const appResult = await env.DEGREE_KV.list({ prefix: 'application:' });
    const applications = [];
    if (appResult.keys && appResult.keys.length > 0) {
      const fetched = await Promise.all(
        appResult.keys.map(k => env.DEGREE_KV.get(k.name, { type: 'json' }))
      );
      applications.push(...fetched.filter(Boolean));
    }

    const certResult = await env.DEGREE_KV.list({ prefix: 'certificate:' });
    const certificates = [];
    if (certResult.keys && certResult.keys.length > 0) {
      const fetched = await Promise.all(
        certResult.keys.map(k => env.DEGREE_KV.get(k.name, { type: 'json' }))
      );
      certificates.push(...fetched.filter(Boolean));
    }

    const stats = {
      totalApplications: applications.length,
      pendingApplications: applications.filter(a => a.status === 'pending' || a.status === 'reviewing').length,
      approvedApplications: applications.filter(a => a.status === 'approved').length,
      rejectedApplications: applications.filter(a => a.status === 'rejected').length,
      totalCertificates: certificates.length,
      validCertificates: certificates.filter(c => c.status === 'valid').length,
      degreeStats: {
        bachelor: certificates.filter(c => c.degreeType === '学士' || c.degreeType === 'bachelor').length,
        master: certificates.filter(c => c.degreeType === '硕士' || c.degreeType === 'master').length,
        phd: certificates.filter(c => c.degreeType === '博士' || c.degreeType === 'phd').length
      },
      departmentStats: {}
    };

    certificates.forEach(c => {
      const dept = c.department || '未知';
      stats.departmentStats[dept] = (stats.departmentStats[dept] || 0) + 1;
    });

    return new Response(JSON.stringify({
      success: true,
      data: stats
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
