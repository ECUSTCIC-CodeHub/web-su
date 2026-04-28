# CIC 苏联分部 - 学位颁发与毕业证书系统

华东理工大学计算机信息交流协会（CIC）苏联分部网站，包含学位申请、审批、证书颁发与验证功能。

> 🎭 本网站纯属搞笑，请勿当真！

## 项目结构

```
web-su/
├── index.html              # 首页
├── wenye.html              # 文野书记介绍页
├── degree.html             # 学位申请与审批系统
├── certificate.html        # 毕业证书查看与验证
├── logo.png                # 网站标志
├── Hammer_and_sickle...svg # 背景图
│
├── edge-functions/         # EdgeOne Pages 版 API（腾讯云）
│   └── api/
│       ├── applications.js         # 申请列表 / 创建
│       ├── applications/[id].js    # 申请详情 / 审批 / 删除
│       ├── certificates.js         # 证书列表 / 创建
│       ├── certificates/[id].js    # 证书详情 / 更新 / 删除
│       ├── stats.js                # 数据统计
│       └── verify.js              # 证书验证
│
├── functions/              # Cloudflare Pages 版 API
│   └── api/                # （目录结构同上）
│
├── edgeone.json            # EdgeOne 配置文件
└── wrangler.toml           # Cloudflare Pages 配置文件
```

## 部署方式

### 方式一：EdgeOne Pages（腾讯云）

1. 在 EdgeOne Pages 控制台创建项目，关联本仓库
2. 在 EdgeOne KV 中创建命名空间，将 `id` 填入 `edgeone.json`
3. 构建配置：输出目录 `.`，无需构建命令

### 方式二：Cloudflare Pages

> ⚠️ 注意：Cloudflare Pages ≠ Cloudflare Workers，部署命令是 `wrangler pages deploy` 而非 `wrangler deploy`。

#### 推荐：Dashboard 部署（最简单）

1. 在 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → 创建 Pages 项目 → 连接 Git 仓库

2. 构建设置：
   - **构建命令**：留空（无需构建）
   - **输出目录**：`.`

3. 创建 KV 命名空间并绑定：
   ```bash
   npx wrangler kv namespace create DEGREE_KV
   ```
   然后在 Dashboard → Pages 项目 → Settings → Functions → KV namespace bindings 中添加：
   - 变量名：`DEGREE_KV`
   - 选择刚创建的 namespace

4. 每次 `git push` 自动部署。

#### CLI 部署（可选）

```bash
# 1. 创建 KV 命名空间
npx wrangler kv namespace create DEGREE_KV

# 2. 在 Dashboard 绑定 KV（见上一步）

# 3. 部署（注意是 pages deploy，不是 deploy）
npx wrangler pages deploy .
```

## API 接口

| 方法   | 路径                          | 说明         |
| ------ | ----------------------------- | ------------ |
| GET    | `/api/stats`                  | 数据统计概览 |
| GET    | `/api/applications`           | 获取申请列表 |
| POST   | `/api/applications`           | 提交学位申请 |
| GET    | `/api/applications/:id`       | 获取申请详情 |
| PUT    | `/api/applications/:id`       | 审批申请     |
| DELETE | `/api/applications/:id`       | 删除申请     |
| GET    | `/api/certificates`           | 获取证书列表 |
| POST   | `/api/certificates`           | 创建证书     |
| GET    | `/api/certificates/:id`       | 获取证书详情 |
| PUT    | `/api/certificates/:id`       | 更新证书     |
| DELETE | `/api/certificates/:id`       | 删除证书     |
| GET    | `/api/verify?id=xxx&code=xxx` | 验证证书真伪 |

## 数据存储

所有数据存储在 KV（Key-Value）中，以 `application:` 和 `certificate:` 为前缀。

### 批准申请自动发证

当通过 `PUT /api/applications/:id` 将申请状态改为 `approved` 时，系统会自动生成对应的毕业证书。

## 许可证

代码属于无产阶级！
