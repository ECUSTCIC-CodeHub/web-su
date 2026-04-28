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
└── README.md
```

## 部署方式

### 方式一：EdgeOne Pages（腾讯云）

#### 前置条件

- 已注册腾讯云账号
- 已开通 [EdgeOne Pages](https://console.cloud.tencent.com/edgeone/pages) 服务

#### 步骤

1. **创建 Pages 项目**
   - 进入 [EdgeOne Pages 控制台](https://console.cloud.tencent.com/edgeone/pages) → 创建项目
   - 关联本仓库（支持 GitHub / Gitee 等 Git 仓库）

2. **创建 KV 命名空间**
   - 进入 [EdgeOne KV 控制台](https://console.cloud.tencent.com/edgeone/kv) → 创建命名空间
   - 记录命名空间 ID（格式：`ns-xxxxxxxx`）
   - 将 ID 填入 `edgeone.json` 的 `kvNamespaces[0].id` 字段：
     ```json
     {
       "name": "web-su",
       "kvNamespaces": [
         {
           "binding": "degree_kv",
           "id": "ns-xxxxxxxx"
         }
       ]
     }
     ```

3. **配置构建**
   - **构建命令**：留空（纯静态，无需构建）
   - **输出目录**：`.`（项目根目录）

4. **部署**
   - 每次 `git push` 触发自动部署
   - 也可在控制台手动触发部署

#### 注意事项

- `edgeone.json` 必须放在项目根目录，EdgeOne 会自动识别配置
- KV 的 `binding` 名称（`degree_kv`）需与 Edge Functions 代码中的变量名一致
- 如果 Functions 报 `degree_kv is not defined`，请检查 KV 绑定是否生效（可能需要重新部署）
- Edge Functions 路由规则由文件目录结构决定，详见下方「路由映射」

#### 路由映射

| 文件路径 | 请求路径 | 支持方法 |
| --- | --- | --- |
| `edge-functions/api/applications.js` | `/api/applications` | GET, POST |
| `edge-functions/api/applications/[id].js` | `/api/applications/:id` | GET, PUT, DELETE |
| `edge-functions/api/certificates.js` | `/api/certificates` | GET, POST |
| `edge-functions/api/certificates/[id].js` | `/api/certificates/:id` | GET, PUT, DELETE |
| `edge-functions/api/stats.js` | `/api/stats` | GET |
| `edge-functions/api/verify.js` | `/api/verify` | GET |

> 方括号 `[id]` 表示动态路由参数，对应 `context.params.id`。

### 方式二：Cloudflare Pages

> ⚠️ 注意：Pages 项目通过 Git 部署时 **不需要 `wrangler.toml`**，配置文件会导致 CI 误判为 Worker 项目。KV 绑定在 Dashboard 中配置即可。

#### 步骤

1. 在 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Workers & Pages → **创建** → **Pages** → 连接 Git 仓库

2. 构建设置：
   - **构建命令**：留空（无需构建）
   - **输出目录**：`.`

3. 绑定 KV（**必须做**，否则 Functions 无法读写数据）：
   - 进入项目 → Settings → Functions → KV namespace bindings
   - 变量名：`DEGREE_KV`
   - 选择已创建的 namespace（id: `2a1c2ced9f0940a2ae3d2d57b20f72b1`）

4. 每次 `git push` 自动部署。

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
