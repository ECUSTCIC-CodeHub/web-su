// 统计数据 API
// GET /api/stats - 获取学位系统统计数据

export async function onRequestGet(context) {
  try {
    // 获取所有申请
    const appResult = await degree_kv.list({ prefix: 'application:' });
    const applications = [];
    if (appResult.keys && appResult.keys.length > 0) {
      const fetched = await Promise.all(
        appResult.keys.map(k => degree_kv.get(k.key, { type: 'json' }))
      );
      applications.push(...fetched.filter(Boolean));
    }

    // 获取所有证书
    const certResult = await degree_kv.list({ prefix: 'certificate:' });
    const certificates = [];
    if (certResult.keys && certResult.keys.length > 0) {
      const fetched = await Promise.all(
        certResult.keys.map(k => degree_kv.get(k.key, { type: 'json' }))
      );
      certificates.push(...fetched.filter(Boolean));
    }

    // 统计
    const stats = {
      totalApplications: applications.length,
      pendingApplications: applications.filter(a => a.status === 'pending' || a.status === 'reviewing').length,
      approvedApplications: applications.filter(a => a.status === 'approved').length,
      rejectedApplications: applications.filter(a => a.status === 'rejected').length,
      totalCertificates: certificates.length,
      validCertificates: certificates.filter(c => c.status === 'valid').length,
      // 按学位类型统计
      degreeStats: {
        bachelor: certificates.filter(c => c.degreeType === '学士' || c.degreeType === 'bachelor').length,
        master: certificates.filter(c => c.degreeType === '硕士' || c.degreeType === 'master').length,
        phd: certificates.filter(c => c.degreeType === '博士' || c.degreeType === 'phd').length
      },
      // 按部门统计
      departmentStats: {}
    };

    // 部门统计
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
