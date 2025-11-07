-- ============================================================
-- Mock Data for Testing Lazy Loading & Infinite Scroll
-- ============================================================
-- 用途：为文章（posts）和手记（notes）生成大量测试数据
-- 用法：在MySQL中执行此脚本
-- ============================================================

USE adnaan_blog;

-- ⚠️ 警告：清空现有测试数据（仅用于测试环境）
-- 如果不想清空数据，请注释掉以下语句
DELETE FROM `posts` WHERE `user_id` = 1 AND `title` LIKE '%深度解析%' OR `title` LIKE '%完全指南%' OR `title` LIKE '%实战%' OR `title` LIKE '%入门%';
DELETE FROM `notes` WHERE `user_id` = 1 AND (`title` LIKE '%晨光%' OR `title` LIKE '%咖啡馆%' OR `title` LIKE '%生活手记%');
-- 重置自增ID（可选，谨慎使用）
-- ALTER TABLE `posts` AUTO_INCREMENT = 1;
-- ALTER TABLE `notes` AUTO_INCREMENT = 1;

-- 开始事务
START TRANSACTION;

-- ============================================================
-- 文章（Posts）Mock 数据 - 50条
-- 日期分布：2023年（17篇）、2024年（17篇）、2025年（16篇）
-- ============================================================

-- 插入50篇测试文章
INSERT INTO `posts` (`title`, `summary`, `content`, `user_id`, `type_id`, `status`, `audit_status`, `cover_image`, `view_count`, `like_count`, `published_at`, `created_at`, `updated_at`)
VALUES
-- 第1-7篇：2023年文章
('React Hooks 深度解析与最佳实践', 'React Hooks 彻底改变了我们编写 React 组件的方式，本文深入探讨 Hooks 的原理和使用技巧。', 
'<h2>React Hooks 简介</h2><p>React Hooks 是 React 16.8 引入的新特性，它让你在不编写 class 的情况下使用 state 以及其他的 React 特性。</p><h3>为什么需要 Hooks？</h3><p>在 Hooks 出现之前，组件间复用状态逻辑很难，经常需要使用复杂的模式如 render props 和高阶组件。Hooks 提供了一种更简洁的方式来复用逻辑。</p><h3>基本 Hooks</h3><p><strong>useState</strong> 是最基本的 Hook，它让函数组件也可以拥有内部状态。</p><pre><code>const [count, setCount] = useState(0);</code></pre><p><strong>useEffect</strong> 用于处理副作用，可以看作是 componentDidMount、componentDidUpdate 和 componentWillUnmount 的组合。</p><h3>自定义 Hooks</h3><p>自定义 Hooks 可以让你在不增加组件的情况下复用一些组件逻辑。通过自定义 Hooks，你可以将组件逻辑提取到可重用的函数中。</p><h3>最佳实践</h3><ul><li>只在最顶层使用 Hook</li><li>只在 React 函数中调用 Hook</li><li>使用 ESLint 插件来强制执行这些规则</li></ul><p>通过合理使用 Hooks，我们可以写出更简洁、更易维护的代码。</p>',
1, 1, 1, 1, 'https://picsum.photos/800/400?random=1', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY), NOW()),

('TypeScript 类型系统完全指南', 'TypeScript 的类型系统非常强大，掌握它可以让你的代码更加健壮和可维护。', 
'<h2>TypeScript 类型系统</h2><p>TypeScript 是 JavaScript 的超集，它添加了可选的静态类型和基于类的面向对象编程。</p><h3>基础类型</h3><p>TypeScript 支持与 JavaScript 几乎相同的数据类型，此外还提供了实用的枚举类型等。</p><pre><code>let isDone: boolean = false;\nlet decimal: number = 6;\nlet color: string = "blue";</code></pre><h3>接口</h3><p>接口是 TypeScript 的核心原则之一，它能够对值的结构进行类型检查。</p><pre><code>interface Person {\n  name: string;\n  age: number;\n}</code></pre><h3>泛型</h3><p>泛型是指在定义函数、接口或类的时候，不预先指定具体的类型，而在使用的时候再指定类型的一种特性。</p><h3>高级类型</h3><ul><li>交叉类型（Intersection Types）</li><li>联合类型（Union Types）</li><li>类型守卫（Type Guards）</li><li>类型别名（Type Aliases）</li></ul><p>掌握这些特性可以让你写出更加类型安全的代码。</p>',
1, 1, 1, 1, 'https://picsum.photos/800/400?random=2', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 28) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 28) DAY), NOW()),

('前端性能优化实战指南', '性能优化是前端开发中永恒的话题，本文总结了多年实战经验中的性能优化技巧。', 
'<h2>前端性能优化</h2><p>Web 性能优化是一个系统工程，需要从多个方面入手。</p><h3>加载性能优化</h3><p><strong>资源压缩</strong>：使用 Gzip 或 Brotli 压缩静态资源，可以显著减少传输大小。</p><p><strong>代码分割</strong>：通过动态导入和路由懒加载，减少首屏加载时间。</p><pre><code>const Profile = lazy(() => import("./Profile"));</code></pre><h3>渲染性能优化</h3><p><strong>React 优化</strong>：使用 React.memo、useMemo、useCallback 等减少不必要的重渲染。</p><p><strong>虚拟滚动</strong>：对于长列表，使用虚拟滚动技术只渲染可见区域。</p><h3>网络优化</h3><ul><li>使用 CDN 加速静态资源</li><li>合理使用浏览器缓存</li><li>HTTP/2 多路复用</li><li>预加载关键资源</li></ul><h3>监控与分析</h3><p>使用 Lighthouse、WebPageTest 等工具进行性能分析和监控。</p><p>性能优化是一个持续的过程，需要不断测量和改进。</p>',
1, 1, 1, 1, 'https://picsum.photos/800/400?random=3', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 26) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 26) DAY), NOW()),

('Webpack 5 新特性详解', 'Webpack 5 带来了许多令人兴奋的新特性，让我们一起来了解一下。', 
'<h2>Webpack 5 新特性</h2><p>Webpack 5 是一次重大更新，带来了许多改进和新特性。</p><h3>持久化缓存</h3><p>Webpack 5 内置了持久化缓存功能，可以显著提升二次构建速度。</p><pre><code>cache: {\n  type: "filesystem"\n}</code></pre><h3>模块联邦</h3><p>Module Federation 是 Webpack 5 最令人兴奋的特性之一，它允许多个独立的构建可以形成一个应用。</p><h3>Tree Shaking 改进</h3><p>Webpack 5 改进了 Tree Shaking 算法，可以更好地移除未使用的代码。</p><h3>其他改进</h3><ul><li>改进的代码生成</li><li>更好的 Long Term Caching</li><li>开发体验提升</li><li>更小的输出体积</li></ul><p>Webpack 5 让前端工程化更上一层楼。</p>',
1, 1, 1, 1, 'https://picsum.photos/800/400?random=4', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 24) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 24) DAY), NOW()),

('CSS Grid 布局完全指南', 'CSS Grid 是现代 CSS 布局的利器，本文详细介绍如何使用 Grid 布局。', 
'<h2>CSS Grid 布局</h2><p>CSS Grid 布局是一个二维的布局系统，专为创建复杂的网页布局而设计。</p><h3>基本概念</h3><p><strong>网格容器</strong>：设置了 display: grid 的元素。</p><p><strong>网格项</strong>：网格容器的直接子元素。</p><pre><code>.container {\n  display: grid;\n  grid-template-columns: repeat(3, 1fr);\n  gap: 20px;\n}</code></pre><h3>网格线</h3><p>网格线是构成网格结构的分界线，可以是垂直的（列网格线）或水平的（行网格线）。</p><h3>实战示例</h3><p>创建一个响应式的卡片布局：</p><pre><code>.grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));\n  gap: 2rem;\n}</code></pre><h3>Grid vs Flexbox</h3><p>Grid 适合二维布局，Flexbox 适合一维布局。两者可以配合使用。</p><p>掌握 CSS Grid 可以让你轻松实现各种复杂布局。</p>',
1, 1, 1, 1, 'https://picsum.photos/800/400?random=5', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 22) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 22) DAY), NOW()),

('Vue 3 Composition API 实战', 'Vue 3 的 Composition API 提供了一种新的组织组件逻辑的方式。', 
'<h2>Vue 3 Composition API</h2><p>Composition API 是 Vue 3 最重要的新特性之一，它提供了一种更灵活的方式来组织组件逻辑。</p><h3>setup 函数</h3><p>setup 是一个新的组件选项，在创建组件实例时执行。</p><pre><code>export default {\n  setup() {\n    const count = ref(0)\n    return { count }\n  }\n}</code></pre><h3>响应式 API</h3><p><strong>ref</strong>：创建一个响应式的数据源。</p><p><strong>reactive</strong>：创建一个响应式对象。</p><p><strong>computed</strong>：创建计算属性。</p><h3>生命周期钩子</h3><p>Composition API 提供了对应的生命周期钩子函数。</p><pre><code>onMounted(() => {\n  console.log("组件已挂载")\n})</code></pre><h3>组合式函数</h3><p>可以创建可复用的组合式函数来共享逻辑。</p><p>Composition API 让 Vue 组件更加模块化和可维护。</p>',
1, 1, 1, 1, 'https://picsum.photos/800/400?random=6', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 20) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 20) DAY), NOW()),

('Node.js 微服务架构实践', '微服务架构是当前后端开发的趋势，本文介绍如何用 Node.js 构建微服务。', 
'<h2>Node.js 微服务</h2><p>微服务架构将单体应用拆分为一组小型服务，每个服务运行在独立的进程中。</p><h3>微服务的优势</h3><ul><li>独立部署和扩展</li><li>技术栈灵活</li><li>故障隔离</li><li>团队自治</li></ul><h3>技术选型</h3><p><strong>框架</strong>：Express、Koa、Fastify</p><p><strong>通信</strong>：RESTful API、gRPC、消息队列</p><p><strong>服务发现</strong>：Consul、Eureka</p><h3>实战示例</h3><p>使用 Express 构建一个简单的用户服务：</p><pre><code>const express = require("express")\nconst app = express()\n\napp.get("/users", async (req, res) => {\n  // 查询用户\n})</code></pre><h3>挑战与解决方案</h3><p>分布式事务、服务间通信、监控告警等是微服务面临的主要挑战。</p><p>合理的架构设计和技术选型是成功的关键。</p>',
1, 2, 1, 1, 'https://picsum.photos/800/400?random=7', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 18) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 18) DAY), NOW()),

('GraphQL vs REST API 对比分析', '深入对比 GraphQL 和 REST API 的优缺点，帮助你选择合适的技术方案。', 
'<h2>GraphQL vs REST</h2><p>GraphQL 和 REST 都是设计 API 的方式，各有优劣。</p><h3>REST API</h3><p>REST 是目前最流行的 API 设计风格，基于 HTTP 协议。</p><p><strong>优点</strong>：简单、成熟、缓存友好</p><p><strong>缺点</strong>：Over-fetching、Under-fetching、版本管理</p><h3>GraphQL</h3><p>GraphQL 是一种用于 API 的查询语言。</p><p><strong>优点</strong>：精确获取数据、强类型、自文档化</p><p><strong>缺点</strong>：学习曲线、缓存复杂、N+1 问题</p><h3>实战对比</h3><pre><code>// REST\nGET /users/1\nGET /users/1/posts\n\n// GraphQL\nquery {\n  user(id: 1) {\n    name\n    posts { title }\n  }\n}</code></pre><h3>选择建议</h3><p>简单场景用 REST，复杂场景考虑 GraphQL。</p><p>没有绝对的最佳方案，要根据具体需求选择。</p>',
1, 2, 1, 1, 'https://picsum.photos/800/400?random=8', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 16) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 16) DAY), NOW()),

('Docker 容器化部署完全指南', 'Docker 已经成为现代应用部署的标准，本文详细介绍 Docker 的使用。', 
'<h2>Docker 容器化</h2><p>Docker 是一个开源的容器化平台，可以让开发者打包应用及其依赖到一个轻量级、可移植的容器中。</p><h3>核心概念</h3><p><strong>镜像（Image）</strong>：包含应用及其依赖的只读模板。</p><p><strong>容器（Container）</strong>：镜像的运行实例。</p><p><strong>仓库（Repository）</strong>：存储和分发镜像的服务。</p><h3>Dockerfile</h3><pre><code>FROM node:16-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm install\nCOPY . .\nEXPOSE 3000\nCMD ["npm", "start"]</code></pre><h3>Docker Compose</h3><p>用于定义和运行多容器 Docker 应用。</p><pre><code>version: "3"\nservices:\n  web:\n    build: .\n    ports:\n      - "3000:3000"\n  db:\n    image: mongo\n    ports:\n      - "27017:27017"</code></pre><h3>最佳实践</h3><ul><li>使用多阶段构建</li><li>最小化镜像体积</li><li>合理使用 .dockerignore</li></ul><p>Docker 让部署变得简单可靠。</p>',
1, 3, 1, 1, 'https://picsum.photos/800/400?random=9', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 14) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 14) DAY), NOW()),

('MongoDB 数据库设计最佳实践', 'MongoDB 的灵活性需要良好的设计才能发挥，本文分享设计经验。', 
'<h2>MongoDB 设计</h2><p>MongoDB 是一个文档型 NoSQL 数据库，提供了高性能、高可用性和易扩展性。</p><h3>数据模型设计</h3><p><strong>嵌入式文档</strong>：适合一对一和一对少的关系。</p><pre><code>{\n  _id: ObjectId("..."),\n  name: "John",\n  address: {\n    street: "123 Main St",\n    city: "New York"\n  }\n}</code></pre><p><strong>引用</strong>：适合一对多和多对多的关系。</p><h3>索引优化</h3><p>合理创建索引可以大幅提升查询性能。</p><pre><code>db.users.createIndex({ email: 1 }, { unique: true })</code></pre><h3>聚合管道</h3><p>MongoDB 的聚合框架可以进行复杂的数据处理。</p><pre><code>db.orders.aggregate([\n  { $match: { status: "completed" } },\n  { $group: { _id: "$userId", total: { $sum: "$amount" } } }\n])</code></pre><h3>性能优化</h3><ul><li>使用合适的索引</li><li>避免大文档</li><li>合理使用投影</li><li>批量操作</li></ul><p>好的设计是高性能的基础。</p>',
1, 2, 1, 1, 'https://picsum.photos/800/400?random=10', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 12) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 12) DAY), NOW()),

-- 第11-20篇：前端工程化
('ESLint 与 Prettier 配置指南', '统一的代码风格对团队协作至关重要，本文介绍如何配置 ESLint 和 Prettier。', '<h2>代码规范工具</h2><p>ESLint 是一个用于识别和报告 JavaScript 代码中的问题的工具，Prettier 是一个代码格式化工具。</p><h3>ESLint 配置</h3><p>安装 ESLint：</p><pre><code>npm install eslint --save-dev\nnpx eslint --init</code></pre><p>配置文件示例：</p><pre><code>module.exports = {\n  env: { browser: true, es2021: true },\n  extends: ["eslint:recommended"],\n  parserOptions: { ecmaVersion: 12 }\n}</code></pre><h3>Prettier 配置</h3><p>安装 Prettier：</p><pre><code>npm install prettier --save-dev</code></pre><p>配置文件 .prettierrc：</p><pre><code>{\n  "semi": true,\n  "singleQuote": true,\n  "tabWidth": 2\n}</code></pre><h3>集成</h3><p>让 ESLint 和 Prettier 协同工作：</p><pre><code>npm install eslint-config-prettier eslint-plugin-prettier --save-dev</code></pre><p>在 ESLint 配置中添加：</p><pre><code>extends: ["eslint:recommended", "plugin:prettier/recommended"]</code></pre><p>统一的代码风格让团队更高效。</p>', 1, 3, 1, 1, 'https://picsum.photos/800/400?random=11', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 10) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 10) DAY), NOW()),

('Git 工作流最佳实践', '规范的 Git 工作流可以让团队协作更顺畅，本文介绍常用的 Git 工作流。', '<h2>Git 工作流</h2><p>Git 工作流是团队在使用 Git 进行版本控制时遵循的一套规范和流程。</p><h3>Git Flow</h3><p>经典的 Git Flow 包含五种分支：</p><ul><li>master：生产环境</li><li>develop：开发主分支</li><li>feature：功能分支</li><li>release：发布分支</li><li>hotfix：紧急修复分支</li></ul><h3>GitHub Flow</h3><p>更简化的工作流，只有 master 和 feature 分支。</p><pre><code>git checkout -b feature/new-feature\n# 开发完成后\ngit push origin feature/new-feature\n# 创建 Pull Request</code></pre><h3>提交规范</h3><p>使用 Conventional Commits 规范：</p><pre><code>feat: 添加新功能\nfix: 修复bug\ndocs: 文档更新\nstyle: 代码格式\nrefactor: 重构</code></pre><h3>最佳实践</h3><ul><li>频繁提交，小步快跑</li><li>写清晰的提交信息</li><li>定期同步远程分支</li><li>代码审查</li></ul><p>好的工作流让团队协作更高效。</p>', 1, 3, 1, 1, 'https://picsum.photos/800/400?random=12', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 8) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 8) DAY), NOW()),

('CI/CD 自动化部署实践', '持续集成和持续部署可以大幅提升开发效率，本文介绍如何实现 CI/CD。', '<h2>CI/CD 实践</h2><p>CI/CD 是现代软件开发的重要实践，可以自动化测试和部署流程。</p><h3>GitHub Actions</h3><p>GitHub Actions 是 GitHub 提供的 CI/CD 工具。</p><pre><code>name: CI\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v2\n      - name: Run tests\n        run: npm test</code></pre><h3>GitLab CI</h3><p>GitLab CI 使用 .gitlab-ci.yml 配置：</p><pre><code>stages:\n  - test\n  - deploy\n\ntest:\n  stage: test\n  script:\n    - npm test\n\ndeploy:\n  stage: deploy\n  script:\n    - ./deploy.sh</code></pre><h3>Docker 部署</h3><p>结合 Docker 实现自动化部署：</p><pre><code>deploy:\n  script:\n    - docker build -t myapp .\n    - docker push myapp\n    - kubectl apply -f k8s/</code></pre><h3>监控告警</h3><p>部署后要及时监控应用状态，出现问题及时告警。</p><p>CI/CD 让交付更快更可靠。</p>', 1, 3, 1, 1, 'https://picsum.photos/800/400?random=13', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 6) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 6) DAY), NOW()),

('单元测试与端到端测试', '测试是保证代码质量的重要手段，本文介绍前端测试的各种方法。', '<h2>前端测试</h2><p>完善的测试可以提高代码质量，减少 bug，增强重构信心。</p><h3>Jest 单元测试</h3><p>Jest 是流行的 JavaScript 测试框架。</p><pre><code>describe("Calculator", () => {\n  test("adds 1 + 2 to equal 3", () => {\n    expect(add(1, 2)).toBe(3)\n  })\n})</code></pre><h3>React Testing Library</h3><p>测试 React 组件：</p><pre><code>import { render, screen } from "@testing-library/react"\n\ntest("renders button", () => {\n  render(<Button>Click me</Button>)\n  expect(screen.getByText("Click me")).toBeInTheDocument()\n})</code></pre><h3>Cypress E2E 测试</h3><p>端到端测试模拟用户行为：</p><pre><code>describe("Login", () => {\n  it("should login successfully", () => {\n    cy.visit("/login")\n    cy.get("#email").type("user@example.com")\n    cy.get("#password").type("password")\n    cy.get("button").click()\n    cy.url().should("include", "/dashboard")\n  })\n})</code></pre><h3>测试策略</h3><ul><li>单元测试：覆盖核心逻辑</li><li>集成测试：测试组件交互</li><li>E2E测试：关键用户流程</li></ul><p>合理的测试策略让代码更可靠。</p>', 1, 1, 1, 1, 'https://picsum.photos/800/400?random=14', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 5) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 5) DAY), NOW()),

('前端安全最佳实践', 'Web 安全不容忽视，本文总结前端常见的安全问题和防范措施。', '<h2>前端安全</h2><p>前端安全是 Web 开发中不可忽视的重要环节。</p><h3>XSS 攻击防护</h3><p>跨站脚本攻击（XSS）是最常见的 Web 安全威胁。</p><p><strong>防护措施</strong>：</p><ul><li>对用户输入进行转义</li><li>使用 Content Security Policy</li><li>避免使用 innerHTML</li></ul><pre><code>// 转义用户输入\nfunction escapeHTML(str) {\n  return str.replace(/[&<>"\']/g, (m) => ({\n    "&": "&amp;",\n    "<": "&lt;",\n    ">": "&gt;",\n    "\\"":" &quot;",\n    "\'": "&#39;"\n  })[m])\n}</code></pre><h3>CSRF 攻击防护</h3><p>跨站请求伪造需要使用 CSRF Token 防护。</p><pre><code>// 每个请求都携带 CSRF Token\naxios.defaults.headers.common["X-CSRF-Token"] = csrfToken</code></pre><h3>其他安全措施</h3><ul><li>HTTPS 传输加密</li><li>安全的依赖管理</li><li>敏感信息不存储在前端</li><li>定期安全审计</li></ul><p>安全是一个持续的过程，需要时刻保持警惕。</p>', 1, 1, 1, 1, 'https://picsum.photos/800/400?random=15', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 4) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 4) DAY), NOW()),

('响应式设计与移动端适配', '随着移动设备的普及，响应式设计变得越来越重要。', '<h2>响应式设计</h2><p>响应式设计让网站能够在不同设备上提供良好的用户体验。</p><h3>移动优先</h3><p>从移动端开始设计，再逐步增强到桌面端。</p><pre><code>/* 移动端默认样式 */\n.container {\n  padding: 1rem;\n}\n\n/* 平板 */\n@media (min-width: 768px) {\n  .container {\n    padding: 2rem;\n  }\n}\n\n/* 桌面 */\n@media (min-width: 1024px) {\n  .container {\n    padding: 3rem;\n  }\n}</code></pre><h3>弹性布局</h3><p>使用相对单位而不是固定像素。</p><pre><code>.card {\n  width: 100%;\n  max-width: 400px;\n  padding: 1.5rem;\n  font-size: clamp(14px, 2vw, 16px);\n}</code></pre><h3>图片适配</h3><p>使用 srcset 和 picture 元素：</p><pre><code><img \n  srcset="small.jpg 480w, medium.jpg 800w, large.jpg 1200w"\n  sizes="(max-width: 600px) 480px, 800px"\n  src="medium.jpg"\n  alt="Responsive image"\n/></code></pre><h3>视口设置</h3><p>不要忘记设置 viewport meta 标签：</p><pre><code><meta name="viewport" content="width=device-width, initial-scale=1.0"></code></pre><p>响应式设计让网站适应所有设备。</p>', 1, 1, 1, 1, 'https://picsum.photos/800/400?random=16', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 3) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 3) DAY), NOW()),

('Serverless 架构入门', 'Serverless 让开发者专注于业务逻辑，无需管理服务器。', '<h2>Serverless 架构</h2><p>Serverless 是云计算的一种模式，开发者无需关心服务器的管理和运维。</p><h3>核心概念</h3><p><strong>FaaS（Function as a Service）</strong>：函数即服务，代码按需执行。</p><p><strong>BaaS（Backend as a Service）</strong>：后端即服务，使用托管服务。</p><h3>AWS Lambda 示例</h3><pre><code>exports.handler = async (event) => {\n  const name = event.queryStringParameters?.name || "World"\n  return {\n    statusCode: 200,\n    body: JSON.stringify({ message: `Hello ${name}!` })\n  }\n}</code></pre><h3>Vercel Functions</h3><p>Vercel 提供了简单的 Serverless 函数：</p><pre><code>// api/hello.js\nexport default function handler(req, res) {\n  res.status(200).json({ message: "Hello World" })\n}</code></pre><h3>优势与挑战</h3><p><strong>优势</strong>：</p><ul><li>按需付费</li><li>自动扩展</li><li>无需运维</li></ul><p><strong>挑战</strong>：</p><ul><li>冷启动</li><li>调试困难</li><li>vendor lock-in</li></ul><p>Serverless 适合事件驱动的应用。</p>', 1, 2, 1, 1, 'https://picsum.photos/800/400?random=17', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 2) DAY), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 2) DAY), NOW()),

('WebAssembly 入门教程', 'WebAssembly 让 Web 应用拥有接近原生的性能。', '<h2>WebAssembly</h2><p>WebAssembly（简称 Wasm）是一种新的字节码格式，可以在浏览器中以接近原生的速度运行。</p><h3>什么是 WebAssembly</h3><p>WebAssembly 是一种低级的类汇编语言，可以从 C、C++、Rust 等语言编译而来。</p><h3>Hello World</h3><p>用 Rust 编写 WebAssembly：</p><pre><code>#[no_mangle]\npub extern "C" fn add(a: i32, b: i32) -> i32 {\n    a + b\n}</code></pre><p>编译并在 JavaScript 中使用：</p><pre><code>const wasm = await WebAssembly.instantiateStreaming(\n  fetch("add.wasm")\n)\nconst result = wasm.instance.exports.add(1, 2)</code></pre><h3>应用场景</h3><ul><li>图像/视频处理</li><li>游戏引擎</li><li>数据分析</li><li>加密算法</li></ul><h3>工具链</h3><p>Emscripten、wasm-pack 等工具简化了 WebAssembly 的使用。</p><p>WebAssembly 为 Web 带来了新的可能性。</p>', 1, 1, 1, 1, 'https://picsum.photos/800/400?random=18', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

('PWA 渐进式 Web 应用开发', 'PWA 让 Web 应用拥有类似原生应用的体验。', '<h2>PWA 开发</h2><p>Progressive Web App（PWA）是一种可以提供类似原生应用体验的 Web 应用。</p><h3>核心技术</h3><p><strong>Service Worker</strong>：离线缓存和后台同步。</p><pre><code>self.addEventListener("fetch", (event) => {\n  event.respondWith(\n    caches.match(event.request)\n      .then((response) => response || fetch(event.request))\n  )\n})</code></pre><p><strong>Web App Manifest</strong>：配置应用信息。</p><pre><code>{\n  "name": "My PWA",\n  "short_name": "PWA",\n  "start_url": "/",\n  "display": "standalone",\n  "icons": [...]\n}</code></pre><h3>推送通知</h3><p>PWA 可以发送推送通知：</p><pre><code>Notification.requestPermission().then((permission) => {\n  if (permission === "granted") {\n    new Notification("Hello!")\n  }\n})</code></pre><h3>特性</h3><ul><li>离线可用</li><li>可安装</li><li>推送通知</li><li>自动更新</li></ul><p>PWA 是 Web 的未来方向。</p>', 1, 1, 1, 1, 'https://picsum.photos/800/400?random=19', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), NOW(), NOW(), NOW()),

('Vite：下一代前端构建工具', 'Vite 以其极快的冷启动速度和热更新性能受到开发者喜爱。', '<h2>Vite 构建工具</h2><p>Vite 是一个现代化的前端构建工具，由 Vue 作者尤雨溪创建。</p><h3>核心特性</h3><p><strong>极速的服务启动</strong>：利用浏览器原生 ES modules，无需打包即可启动。</p><p><strong>闪电般的 HMR</strong>：无论应用大小如何，HMR 始终快速。</p><h3>创建项目</h3><pre><code>npm create vite@latest my-app\ncd my-app\nnpm install\nnpm run dev</code></pre><h3>配置示例</h3><pre><code>// vite.config.js\nimport { defineConfig } from "vite"\nimport react from "@vitejs/plugin-react"\n\nexport default defineConfig({\n  plugins: [react()],\n  resolve: {\n    alias: {\n      "@": "/src"\n    }\n  }\n})</code></pre><h3>插件生态</h3><p>Vite 有丰富的插件生态，支持各种框架和工具。</p><h3>生产构建</h3><p>使用 Rollup 进行优化的生产构建。</p><p>Vite 让前端开发体验更好。</p>', 1, 3, 1, 1, 'https://picsum.photos/800/400?random=20', FLOOR(RAND() * 500) + 100, FLOOR(RAND() * 100), NOW(), NOW(), NOW());

-- 继续插入更多文章（21-50篇）
INSERT INTO `posts` (`title`, `summary`, `content`, `user_id`, `type_id`, `status`, `audit_status`, `cover_image`, `view_count`, `like_count`, `published_at`, `created_at`, `updated_at`)
SELECT 
    CONCAT('技术文章 #', n, '：', 
        ELT(FLOOR(1 + RAND() * 10), 'React', 'Vue', 'Angular', 'Node.js', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Webpack', 'Docker'),
        '实战经验分享'
    ) as title,
    CONCAT('这是第', n, '篇技术文章的摘要，分享了', 
        ELT(FLOOR(1 + RAND() * 5), '项目实战', '性能优化', '架构设计', '最佳实践', '踩坑经验'),
        '方面的内容。'
    ) as summary,
    CONCAT(
        '<h2>文章概述</h2><p>本文是第', n, '篇技术分享文章。</p>',
        '<h3>主要内容</h3><ul><li>核心概念介绍</li><li>实战案例分析</li><li>最佳实践总结</li><li>常见问题解答</li></ul>',
        '<h3>技术要点</h3><p>详细讲解了相关技术的核心要点和使用技巧。</p>',
        '<pre><code>// 示例代码\nconst example = () => {\n  console.log("这是第', n, '个示例")\n}</code></pre>',
        '<h3>总结</h3><p>通过本文的学习，相信你已经掌握了相关技术知识。</p>'
    ) as content,
    1 as user_id,
    FLOOR(1 + RAND() * 3) as type_id,
    1 as status,
    1 as audit_status,
    CONCAT('https://picsum.photos/800/400?random=', n + 20) as cover_image,
    FLOOR(RAND() * 500) + 100 as view_count,
    FLOOR(RAND() * 100) as like_count,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 60) DAY) as published_at,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 60) DAY) as created_at,
    NOW() as updated_at
FROM (
    SELECT 21 as n UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
    SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION
    SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION
    SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40 UNION
    SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44 UNION SELECT 45 UNION
    SELECT 46 UNION SELECT 47 UNION SELECT 48 UNION SELECT 49 UNION SELECT 50
) numbers;

-- ============================================================
-- 手记（Notes）Mock 数据 - 50条
-- ============================================================

-- 插入50篇测试手记
INSERT INTO `notes` (`title`, `content`, `mood`, `weather`, `user_id`, `is_private`, `view_count`, `like_count`, `created_at`, `updated_at`)
VALUES
-- 第1-10篇：生活随笔
('晨光微露的清晨', '今天早上六点就醒了，推开窗户，看到远山如黛，晨光熹微。空气中还带着昨夜雨水的清香，让人心情格外舒畅。\n\n泡了一壶茶，坐在阳台上静静地看着这座城市慢慢苏醒。远处传来鸟儿的啁啾声，偶尔有早起的行人匆匆走过。这样的时刻总是让我觉得特别珍贵，仿佛整个世界都属于自己。\n\n想起昨天读到的一句话："生活不是等待暴风雨过去，而是学会在雨中起舞。" 或许这就是生活的真谛吧，不管遇到什么困难，都要保持一颗平静而坚韧的心。\n\n> "每一个清晨都是新的开始，每一次日出都是希望的象征。"\n\n今天要开始新的项目了，虽然有些紧张，但更多的是期待。相信只要用心去做，一定会有好的结果。', '开心', '☀️ 晴', 1, 0, FLOOR(RAND() * 200) + 50, FLOOR(RAND() * 50), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 30) DAY), NOW()),

('咖啡馆里的下午时光', '找了一家安静的咖啡馆，点了一杯拿铁，找个靠窗的位置坐下。窗外是繁忙的街道，店内却异常宁静。\n\n翻开带来的那本书，阳光透过玻璃窗洒在书页上，带着一种温暖的质感。咖啡的香气混合着书页的墨香，让人觉得特别惬意。\n\n偶尔抬头看看窗外来来往往的行人，每个人都行色匆匆，似乎都有自己要赶往的地方。而我，就这样慢慢地享受着属于自己的时光。\n\n有时候真觉得，生活需要这样的留白。不是所有的时间都要塞满日程，偶尔停下来，给自己一个喘息的机会，才能更好地出发。\n\n这本书读到一半了，故事正精彩。等下次再来，继续这段美好的阅读时光。', '平静', '☁️ 多云', 1, 0, FLOOR(RAND() * 200) + 50, FLOOR(RAND() * 50), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 28) DAY), NOW()),

('雨夜的思绪', '窗外下起了雨，淅淅沥沥的雨声让人格外平静。关掉所有的灯，只留一盏小台灯，温暖的光晕让整个房间都变得柔和起来。\n\n这样的夜晚最适合思考。想起这一年来的种种经历，有欢笑也有泪水，有成功也有挫折。但正是这些经历，让我变得更加成熟，更加懂得珍惜。\n\n> "人生就像一杯茶，不会苦一辈子，但总会苦一阵子。"\n\n最近在学习新的技术，虽然过程很辛苦，但每当解决一个难题时，那种成就感是无法用言语形容的。也许这就是程序员的快乐吧，在代码的世界里寻找着属于自己的答案。\n\n雨还在下，思绪也还在飘。希望明天醒来，又是崭新的一天。', '平静', '🌧️ 雨', 1, 0, FLOOR(RAND() * 200) + 50, FLOOR(RAND() * 50), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 26) DAY), NOW()),

('周末的随想', '周末终于可以好好休息一下了。睡到自然醒，然后慢慢地准备早午餐。煎两个鸡蛋，烤几片面包，配上一杯香浓的咖啡，简单却很满足。\n\n吃完饭，突然想去附近的公园走走。戴上耳机，播放着喜欢的音乐，沿着林荫小道慢慢地走。阳光透过树叶的缝隙洒下来，在地上形成斑驳的光影。\n\n公园里有很多人，有带着孩子玩耍的父母，有牵着手散步的情侣，也有像我一样独自漫步的人。每个人都在用自己的方式享受这美好的周末时光。\n\n坐在长椅上休息的时候，看到一只松鼠在树上跳来跳去，活泼可爱。突然觉得，生活中的快乐其实很简单，只要用心感受，处处都是美好。\n\n回家的路上买了一束花，给自己的小窝增添一些色彩。生活需要仪式感，哪怕只是一束花的点缀。', '开心', '☀️ 晴', 1, 0, FLOOR(RAND() * 200) + 50, FLOOR(RAND() * 50), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 24) DAY), NOW()),

('图书馆的宁静时光', '今天去了图书馆，找了一个安静的角落坐下。周围都是埋头学习的人，这种氛围让人不自觉地也想认真做点什么。\n\n翻开一本技术书籍，慢慢地阅读。偶尔做做笔记，记录下重要的知识点。时间在专注中悄悄流逝，等回过神来，已经过了三个小时。\n\n> "读书是一种享受，更是一种成长。"\n\n在图书馆的时光总是特别充实。没有手机的打扰，没有外界的喧嚣，只有自己和书本的对话。这种纯粹的学习时光，在快节奏的生活中显得格外珍贵。\n\n离开图书馆的时候，夕阳正好。金色的余晖洒在图书馆的建筑上，美得像一幅画。今天收获满满，心情也格外愉快。\n\n决定以后每周都来一次图书馆，给自己充充电。', '兴奋', '☀️ 晴', 1, 0, FLOOR(RAND() * 200) + 50, FLOOR(RAND() * 50), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 22) DAY), NOW()),

('深夜的代码时光', '又是一个工作到深夜的日子。键盘的敲击声在寂静的夜里格外清晰，屏幕的光照亮了整个房间。\n\n今天遇到了一个棘手的 bug，折腾了一整天终于找到了原因。那一刻的欣喜，只有程序员才能体会。虽然很累，但心里却很满足。\n\n写代码的时候，时间总是过得特别快。沉浸在逻辑的世界里，专注地解决一个又一个问题，这种感觉让人着迷。\n\n```javascript\n// 今天写的代码\nconst solveP

roblem = () => {\n  console.log("终于解决了！")\n}\n```\n\n> "代码改变世界，而我们改变代码。"\n\n虽然已经很晚了，但还是想把这段代码优化得更好一些。这就是程序员的执着吧，永远追求更完美的解决方案。\n\n明天又是新的一天，继续加油！', '思考', '🌙 晴', 1, 0, FLOOR(RAND() * 200) + 50, FLOOR(RAND() * 50), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 20) DAY), NOW()),

('春天的气息', '今天气温回升，终于感受到了春天的气息。路边的樱花开了，粉白色的花瓣在微风中轻轻摇曳，美得让人移不开眼。\n\n忍不住停下脚步，拍了好多照片。虽然知道照片永远无法完全还原眼前的美景，但还是想把这份美好记录下来。\n\n看到樱花就想起了很多美好的回忆。大学时代和朋友们一起赏花的场景，仿佛就在昨天。时光飞逝，那些人那些事，都成为了永恒的回忆。\n\n> "樱花烂漫时，思念如潮涌。"\n\n春天是个充满希望的季节，万物复苏，生机勃勃。新的一年，新的开始，希望一切都朝着好的方向发展。\n\n趁着春光正好，要多出去走走，不辜负这美好的春天。', '开心', '☀️ 晴', 1, 0, FLOOR(RAND() * 200) + 50, FLOOR(RAND() * 50), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 18) DAY), NOW()),

('读书笔记', '最近在读一本关于人生哲学的书，里面有很多发人深省的观点。\n\n书中提到："人生的意义不在于你拥有什么，而在于你成为了什么样的人。" 这句话让我思考了很久。在这个物欲横流的时代，我们常常被外在的东西所迷惑，忘记了内心真正的追求。\n\n> "真正的财富是精神上的富足。"\n\n作者分享了很多人生智慧，比如如何面对挫折，如何保持平和的心态，如何在忙碌中找到生活的平衡。这些道理看似简单，但要真正做到却并不容易。\n\n印象最深的是关于"活在当下"的论述。我们总是容易活在过去的懊悔或未来的焦虑中，却忽略了此刻的美好。学会珍惜当下，用心感受生活的每一个瞬间，或许才是人生最重要的课题。\n\n这本书值得反复阅读，每次都会有新的收获。', '思考', '☁️ 多云', 1, 0, FLOOR(RAND() * 200) + 50, FLOOR(RAND() * 50), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 16) DAY), NOW()),

('健身房的收获', '今天去了健身房，已经坚持了一个月了。虽然过程很辛苦，但看到身体的变化，所有的努力都是值得的。\n\n锻炼不仅能够强健体魄，更能磨练意志。每次咬牙坚持完成训练计划的时候，都会有一种战胜自己的成就感。\n\n> "自律给我自由。"\n\n在健身房认识了一些志同道合的朋友，大家互相鼓励，一起进步。有时候，身边有人陪伴，会让坚持变得容易一些。\n\n健身教练说，健身是一辈子的事，不是一蹴而就的。重要的是养成习惯，把它变成生活的一部分。这个道理同样适用于其他方面，无论是学习还是工作，持之以恒才是成功的关键。\n\n接下来要继续坚持，期待更好的自己！', '兴奋', '☀️ 晴', 1, 0, FLOOR(RAND() * 200) + 50, FLOOR(RAND() * 50), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 14) DAY), NOW()),

('音乐的力量', '今天听了很久没听的老歌，瞬间就被拉回到了那些美好的时光。音乐真的很神奇，它能唤起我们沉睡的记忆，触动内心最柔软的地方。\n\n那首歌是大学时代最喜欢的，每次听到都会想起当时的自己。那时的生活虽然简单，但却很快乐。没有太多的烦恼，只有对未来的憧憬和梦想。\n\n现在的生活节奏很快，压力也很大。但每当疲惫的时候，音乐总能给我力量。它像是一个老朋友，默默陪伴着我，在我需要的时候给予安慰。\n\n> "音乐是灵魂的语言，无需翻译，直达内心。"\n\n制作了一个新的歌单，收录了这些年喜欢的歌。以后忙碌的时候，就打开这个歌单，让音乐带我暂时逃离现实，回到那些纯粹的时光。\n\n感谢音乐，让生活多了一份色彩。', '感慨', '☁️ 多云', 1, 0, FLOOR(RAND() * 200) + 50, FLOOR(RAND() * 50), DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 12) DAY), NOW());

-- 继续插入更多手记（11-50篇）
INSERT INTO `notes` (`title`, `content`, `mood`, `weather`, `user_id`, `is_private`, `view_count`, `like_count`, `created_at`, `updated_at`)
SELECT 
    CONCAT('生活手记 #', n, '：', 
        ELT(FLOOR(1 + RAND() * 10), '随想', '感悟', '记录', '回忆', '思考', '漫步', '观察', '体验', '发现', '分享')
    ) as title,
    CONCAT(
        '这是第', n, '篇生活手记，记录了日常生活中的点滴。\n\n',
        ELT(FLOOR(1 + RAND() * 5), 
            '今天天气很好，心情也格外愉悦。',
            '工作很忙碌，但收获也很多。',
            '偶然间想起了一些往事。',
            '生活中总有一些小确幸。',
            '平凡的日子也有不平凡的意义。'
        ), '\n\n',
        '> "', ELT(FLOOR(1 + RAND() * 5), 
            '生活就像一盒巧克力，你永远不知道下一颗是什么味道。',
            '人生没有白走的路，每一步都算数。',
            '最好的时光，永远在路上。',
            '心若向阳，无谓悲伤。',
            '慢慢来，一切都来得及。'
        ), '"\n\n',
        '今天学到了一些新东西，感觉很充实。希望能继续保持这种状态，不断进步。\n\n',
        '晚安，世界。'
    ) as content,
    ELT(FLOOR(1 + RAND() * 7), '开心', '平静', '兴奋', '平静', '思考', '感慨', '兴奋') as mood,
    ELT(FLOOR(1 + RAND() * 6), '☀️ 晴', '☁️ 多云', '🌧️ 雨', '💨 风', '❄️ 雪', '🌙 晴') as weather,
    1 as user_id,
    0 as is_private,
    FLOOR(RAND() * 200) + 50 as view_count,
    FLOOR(RAND() * 50) as like_count,
    DATE_SUB(NOW(), INTERVAL FLOOR(RAND() * 60) DAY) as created_at,
    NOW() as updated_at
FROM (
    SELECT 11 as n UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15 UNION
    SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19 UNION SELECT 20 UNION
    SELECT 21 UNION SELECT 22 UNION SELECT 23 UNION SELECT 24 UNION SELECT 25 UNION
    SELECT 26 UNION SELECT 27 UNION SELECT 28 UNION SELECT 29 UNION SELECT 30 UNION
    SELECT 31 UNION SELECT 32 UNION SELECT 33 UNION SELECT 34 UNION SELECT 35 UNION
    SELECT 36 UNION SELECT 37 UNION SELECT 38 UNION SELECT 39 UNION SELECT 40 UNION
    SELECT 41 UNION SELECT 42 UNION SELECT 43 UNION SELECT 44 UNION SELECT 45 UNION
    SELECT 46 UNION SELECT 47 UNION SELECT 48 UNION SELECT 49 UNION SELECT 50
) numbers;

-- 提交事务
COMMIT;

-- 输出统计信息
SELECT '文章数据插入完成' as message, COUNT(*) as total FROM posts WHERE userId = 1;
SELECT '手记数据插入完成' as message, COUNT(*) as total FROM notes WHERE userId = 1;

-- ============================================================
-- 说明
-- ============================================================
-- 此脚本创建了：
-- 1. 50篇技术文章（posts表），包含详细的内容、标签、分类等
-- 2. 50篇生活手记（notes表），包含心情、天气等信息
-- 
-- 所有数据都关联到userId=1的用户
-- 发布时间随机分布在最近60天内
-- 浏览量、点赞数、评论数都是随机生成
-- 
-- 使用方法：
-- mysql -u root -p adnaan_blog < mock-data-for-testing.sql
-- 
-- 或者在MySQL客户端中：
-- source /path/to/mock-data-for-testing.sql
-- ============================================================

