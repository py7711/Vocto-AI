# Votxt 项目结构说明

本文档用于说明当前仓库的目录边界、保留原则和清理规则。后续整理项目时，以本文档作为判断源码、兼容层、交付文档和临时材料的依据。

## 1. 顶层目录

| 路径 | 用途 | 清理规则 |
| --- | --- | --- |
| `src/app` | Next.js App Router 页面、重定向路由和 API 路由。 | 保留。删除前必须确认没有页面入口、外部兼容入口或前端调用。 |
| `src/components` | 页面组件、工作台组件和复用 UI。 | 保留。未引用组件需要先用 `rg` 确认没有动态导入或路由引用。 |
| `src/lib` | 认证、数据库、存储、队列、导出、兼容协议等服务端工具。 | 保留。`*-compat.ts` 是旧客户端或外部接口兼容层，不能仅凭文件名删除。 |
| `src/server` | AI、媒体预处理、转写和翻译等后端领域逻辑。 | 保留。Worker 和 API 路由会引用这里的能力。 |
| `src/worker` | BullMQ 长任务 Worker。 | 保留。生产环境需要独立运行。 |
| `config` | Next.js 等运行时配置拆分文件。 | 保留。只放构建或框架配置，不放业务逻辑；兼容 rewrite 删除前需按路由合同规则审计。 |
| `prisma` | Prisma 模型和 MySQL/TiDB SQL 交付脚本。 | 保留。修改数据模型时需同步 Prisma、完整 SQL 和增量 SQL。 |
| `messages` | 多语言文案包。 | 保留。面向用户的语言内容在这里维护。 |
| `public` | 静态资源、Logo、博客封面和产品图片。 | 保留。删除图片前需要确认页面或 Markdown 没有引用。 |
| `docs` | 中文交付文档和项目说明。 | 只保留中文、可交付、可维护的文档。调研过程材料和临时截图不放入本目录。 |
| `scripts` | 构建、生成或维护脚本。 | 保留有明确调用方式的脚本；例如 `pnpm run assets:blog-covers` 用于给没有 PNG 的博客文章生成 SVG 封面。废弃脚本需删除并同步文档。 |

## 2. 路由结构

`src/app/[locale]` 是主要的多语言页面入口，例如 `/zh/dashboard`、`/en/pricing`。根级页面目录（例如 `src/app/dashboard`、`src/app/pricing`）通常用于兼容旧链接或执行默认语言重定向，删除前必须确认不会破坏历史链接。

`src/app/api/tasks` 是工作台内部任务接口，返回前端需要的任务结构。`src/app/api/transcriptions` 和 `src/app/api/v1` 是面向旧客户端、公开 API 或第三方集成的兼容接口，虽然和 `tasks` 有重叠，但响应结构和字段命名不同，不应在没有替代方案时删除。

`src/app/api/account/api-keys` 和 `src/app/api/account/webhooks` 目前只作为公开 API、旧客户端和历史数据模型的兼容支撑保留。个人版设置页不展示 API Key、Webhook、团队成员和审计日志管理入口；如果未来重新开放，需要同步更新产品文档、价格页、权限策略和数据库迁移说明。

短路径到 `/api/*` 的 rewrite 统一维护在 `config/legacy-rewrites.mjs`。这些 rewrite 和根级兼容路由一样属于外部访问合同，不应为了缩短配置文件直接删除；如果要退役，至少需要先确认访问日志、公开文档、邮件链接、OAuth/支付回调和旧客户端版本。

### 页面族

页面目录按“正式多语言入口”和“根级兼容入口”分层：

- `src/app/[locale]/dashboard`、`settings`、`upload`、`transcriptions`：登录后工作台页面，以多语言路径为主。
- `src/app/[locale]/pricing`、`features`、`faq`、`docs`、`security`、`blog`、`l`、`languages`、`tools`：公开内容、SEO 着陆页和工具页。
- `src/app/[locale]/auth/*`：登录、注册、邮箱验证、忘记密码、重置密码、AppSumo 激活和 OAuth 回调。
- 根级同名页面目录：通常只重定向到默认语言或复用 `[locale]` 页面，属于历史链接兼容。

新增页面时优先放在 `[locale]` 下；只有确实需要旧链接、第三方回调、邮件链接或短路径入口时，才新增根级目录。

### API 分组

API 目录按调用方分组：

- `src/app/api/auth`：账号登录、注册、OAuth、邮箱验证、密码重置。
- `src/app/api/tasks`：当前工作台内部任务、转写、导出、分享、评分、文件夹和任务状态接口。
- `src/app/api/transcriptions`：旧客户端使用的转写资源接口，保留 `fileId`、`transcriptionFileId`、`languageCode` 等历史字段。
- `src/app/api/upload` 与根级 `src/app/upload`：旧上传协议和对象存储签名接口，保留 `uploadUrl`、`signedUrl`、`fileId` 等旧字段别名。
- `src/app/api/share` 与根级 `src/app/shares`：当前分享接口和旧分享短路径。
- `src/app/api/tools` 与根级 `src/app/tools`：公开工具页调用的媒体解析、YouTube 字幕和下载信息接口。
- `src/app/api/v1`：公开 API 形态，使用 API Key 权限、`success/data/timestamp` 响应包装和 snake_case 字段。
- `src/app/api/account`、`api-keys`、`entitlements`、`billing`、`google-drive`、`folders`、`user`：账号、订阅、第三方集成和历史客户端辅助接口。

这些分组可能调用同一批底层服务，但对外字段合同不同。清理时应优先合并底层实现，不要直接合并或删除外层路由文件。

### 根级兼容路由

仓库中存在一批根级页面和 API 路由，它们通常只做重定向、复用 `[locale]` 页面或重新导出 `src/app/api/*` 下的处理函数。例如：

- `src/app/faq`、`src/app/privacy`、`src/app/terms`：保留旧 URL，并重定向到默认语言或新的规范页面。
- `src/app/auth`、`src/app/settings`、`src/app/transcriptions`：兼容历史客户端、邮件链接、OAuth 回调或第三方保存的入口。
- `src/app/checkout`、`src/app/customer-portal`、`src/app/folders`、`src/app/google-drive`、`src/app/upload`、`src/app/user`：通常是旧版移动端或外部集成调用的短路径代理。
- `src/app/tasks/*`、`src/app/tools/*`、`src/app/shares/*`：兼容旧工具页、旧移动端、旧分享详情和旧分享导出接口，内部会转发到当前 `/api/tasks`、`/api/tools` 或 `/api/share` 实现。只包含字段映射的兼容文件需要保留中文注释说明旧字段与新接口的关系。

这类文件代码量很小，但属于“路由合同”的一部分。只有同时满足以下条件时才删除：

- 前端代码、邮件模板、OAuth 回调配置、支付平台回调配置和公开文档都不再引用。
- 生产访问日志已经确认一段时间内没有外部流量。
- 已有明确的替代路径，并且需要时能返回 `308`、`410` 或兼容错误响应。

如果无法取得访问日志，优先保留。单行 `redirect` 或 `export` 代理由本节统一解释；包含字段映射、方法转换或请求体重写的适配文件，应在文件内补充中文注释说明兼容原因。

如果两个路由文件内容完全相同，且都只是重新导出同一个规范实现，应优先保留有明确历史入口价值的一份，删除没有代码、文档、配置或访问合同支撑的重复代理。删除前至少要完成全文路径搜索、`@/app` 代理目标检查和相同文件扫描。`pnpm run structure:check` 会自动检查完全重复的 `route.ts`/`page.tsx`，以及所有 `@/app` 代理导入目标是否存在。

对于已经在 `config/legacy-rewrites.mjs` 中完整覆盖的短路径 API（例如 `/transcriptions`、`/transcriptions/:taskId/*`、`/upload/multipart/*`、`/folders/*`、`/google-drive/*`、`/tools/youtube-*`、`/checkout/stripe`、`/customer-portal`、`/shares/*`），不要再额外保留只包含 `export {GET}` 或 `export {POST}` 的根级 route 文件。短路径访问合同由 rewrite 统一承接，规范实现仍维护在 `src/app/api/*` 下。如果旧短路径使用了和规范接口不同的 HTTP 方法，应在规范 API 文件中显式保留方法别名，并用中文注释说明兼容原因。

`src/app/api` 内部仍允许保留少量别名路由，例如 `/api/uploads`、`/api/api-keys` 和 `/api/export/batch`。这些路径本身就是 API 合同，不能用根级 rewrite 替代；如果只是重新导出规范实现，需要在 API 分组说明里能解释其历史入口价值。

### 可达性审计

清理源码前可以用依赖图脚本从 `src/app`、`src/worker`、`middleware.ts` 和 `src/i18n.ts` 出发检查静态可达文件。当前审计结果显示，业务组件、库和服务端模块均可由入口追踪到；`src/types/lamejs.d.ts` 是全局类型声明文件，不会出现在普通 import 图中，但 `utility-tool-widget.tsx` 依赖 `lamejs`，该声明文件必须保留。

依赖图结果只能作为删除候选来源，不能单独作为删除依据。删除前仍需确认动态导入、Next.js 约定文件、全局声明文件、外部路由访问合同和文档引用。

整理源码后需要运行 `pnpm run source:check`。该脚本会从 Next.js 约定文件、Worker、配置文件和维护脚本入口建立静态可达性图，发现不可达源码时要求删除或补充保留理由；同时会检查安全、额度、队列、存储、兼容接口、公开 API、Webhook、媒体预处理和 Worker 等关键边界是否有中文注释。

## 3. 数据库脚本

`prisma/schema.prisma` 是运行时模型来源。`prisma/sql/all.sql` 是带中文字段注释的完整交付脚本，会重建全部业务表并写入种子数据。

整理数据库相关代码时，需要同步检查：

- `prisma/schema.prisma`
- `prisma/sql/all.sql`
- `prisma/sql/README.md`
- `docs/aws-ubuntu-worker.md`
- `docs/deployment.md`
- `product-doc.md`

个人版页面不展示团队工作区、成员管理和审计日志，但全新数据库仍应保留公开 API、Webhook、分享表需要的兼容表。当前仓库不再保留分散增量 SQL；已有生产库升级前必须先备份，再按 `schema.prisma` 和 `all.sql` 的差异生成迁移方案。

## 4. 文档规则

项目文档统一使用中文。保留文档应满足至少一个条件：

- 面向开发、部署、运维或交付有直接价值。
- 描述当前产品能力或当前数据库结构。
- 记录必须长期遵守的接口兼容规则。

当前登记的项目文档只有：

- `README.md`
- `product-doc.md`
- `docs/aws-ubuntu-worker.md`
- `docs/deployment.md`
- `docs/project-structure.md`
- `prisma/sql/README.md`

以下内容不作为项目文档保留：

- 克隆竞品或旧站点时生成的英文调研记录。
- 一次性截图、页面对比图或临时视觉参考。
- 已经被产品文档、部署文档或代码注释覆盖的过程材料。

修改、增加或删除 Markdown 文档后，需要运行 `pnpm run docs:check`。该脚本会检查 Markdown 文档是否都在本节登记、是否包含足够中文内容，以及是否残留旧品牌、外部站点登录凭据、克隆过程说明等不应交付的内容。修改页面或 API 路由后，还需要运行 `pnpm run structure:check`，确认 `product-doc.md` 的页面清单和 API 清单覆盖当前实现。

## 5. 注释规则

代码注释以中文为主，优先写在复杂边界处：

- 认证、密码哈希、会话签名等安全逻辑。
- 额度预留、释放、结算等容易造成资金或配额错误的事务。
- Worker、队列、外部转写服务和降级策略。
- 兼容接口中字段映射、旧客户端行为和响应格式差异。

不要求给简单赋值、显而易见的 JSX 或纯类型定义添加噪声注释。注释应解释“为什么这样做”和“这个边界不能随意改什么”，而不是重复代码表面含义。

## 6. 组件拆分规则

`src/components/workspace` 是工作台主界面模块，`Workspace.tsx` 负责状态编排和 API 调用，`sidebar.tsx`、`marketing.tsx`、`panels.tsx`、`primitives.tsx`、`copy.ts`、`types.ts` 分别承载侧栏、公开产品区块、内容面板、基础 UI、文案和类型。即使某些文件没有被全局路径别名引用，也可能被 `Workspace.tsx` 通过相对路径引用，删除前必须检查相对导入。

`src/components/*-page.tsx` 多数对应一个或一组页面族，例如 `auth-pages.tsx`、`settings-page.tsx`、`transcription-page.tsx`、`tool-page.tsx`。如果页面组件只被根级和 `[locale]` 两套路由复用，不应拆成重复页面。

## 7. 静态资源规则

`public/blog` 的图片由 `src/lib/blog.ts` 的 `coverImage` 字段引用，删除或改名时必须同步检查博客列表和详情页。`public/votxt-assets` 只保留页面真实引用的产品截图和流程箭头等素材；未被源码、文档或配置引用的设计稿导出物应删除，不作为“备用素材”长期放在仓库里。品牌 Logo 使用根级 `public/votxt-logo.svg` 和 `public/votxt-logo-dark.svg`，通过 `src/components/brand-logo.tsx` 统一渲染，不要在资产目录里再保留未引用的重复 Logo。

`public/favicon.svg`、`public/votxt-logo.svg` 和 `public/votxt-logo-dark.svg` 属于约定入口资源，分别被 App metadata 和页面 Logo 使用。它们不能仅因文件名没有出现在普通链接列表里就删除。

清理静态资源后需要运行 `pnpm run assets:check`。该脚本会扫描 `public` 中的文件是否被源码、消息包或项目文档引用，并对白名单中的约定入口资源做保留处理。

## 8. 依赖与脚本规则

清理 `package.json` 时，需要区分三类依赖：

- 源码依赖：会在 `src` 或 `scripts` 中通过 `import`/`require` 使用，例如 Prisma Client、S3 SDK、转写服务 SDK、导出库、Redis、队列和 UI 图标库。
- CLI/构建依赖：可能没有源码导入，但由 npm script、Next、Prisma、Tailwind、PostCSS、ESLint 或 TypeScript 工具链调用，例如 `next`、`prisma`、`tsx`、`typescript`、`tailwindcss`、`postcss`、`autoprefixer`、`eslint`、`eslint-config-next`。
- 类型依赖：只参与 TypeScript 类型检查，例如 `@types/node`、`@types/react`、`@types/react-dom`，不能因为源码里没有运行时导入就删除。

脚本目录只保留有 npm script 或文档入口的维护脚本。新增脚本时，需要同步 `package.json` 和中文文档；删除脚本时，需要先检查 README、部署文档、CI、包脚本和人工运维流程是否仍引用。

修改 `package.json` 依赖后需要运行 `pnpm run deps:check`。该脚本会扫描源码、脚本、配置和项目文档中的依赖名，框架隐式依赖需要在脚本白名单里写明；不要仅凭 `node_modules` 中存在某个包就保留它。

整理项目结构后，需要运行 `pnpm run structure:check`。该脚本会检查路由重复、`@/app` 导入目标、产品文档页面/API 覆盖、Prisma model 与 `prisma/sql/all.sql` 表名一致性，以及旧分散 SQL 脚本引用是否已经清理。

整理源码、兼容层或维护脚本后，需要运行 `pnpm run source:check`。如果它报告静态不可达文件，应优先删除；确实属于 Next.js 约定入口、全局类型声明或运行时外部入口时，才在脚本中显式登记保留原因。

删除功能或重构组件后，需要运行 `pnpm run unused:check`。该脚本使用 TypeScript 的未使用声明和未使用参数检查，发现未使用 import、类型、局部变量、函数参数或组件 props 时，应优先删除；仅当参数属于外部框架约定签名时，才用下划线前缀表达保留原因。

## 9. 生成产物和本地文件

以下内容属于本地生成产物或机器文件，不进入项目结构：

- `.next`
- `.pnpm-store`
- `tsconfig.tsbuildinfo`
- `.DS_Store`
- `coverage`
- `dist`
- `*.log`
- `exports`
- `uploads`

这些路径已经在 `.gitignore` 中。若本地出现，可以直接删除；重新构建或运行时会按需生成。
