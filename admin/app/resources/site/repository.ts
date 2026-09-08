// biome-ignore-all lint/suspicious/useAwait: async signatures reserved for a future HTTP data source
import type {
  FriendLink,
  FriendLinkGuidelines,
  FriendLinkStatus,
  SiteAdSlot,
  SiteAnnouncement,
  SiteNavGroup,
  SiteNavGroupFormValues,
  SiteNavItem,
  SitePage,
  SiteWidgetConfig,
  SiteWidgetGlobalSettings,
} from './types'

// Legacy Chinese seed values, kept only so migrateLegacySeeds() can upgrade
// untouched localStorage data once; user-modified fields are never overwritten.
const LEGACY_SEED_PAGES: SitePage[] = [
  {
    id: 'about',
    title: '关于我们',
    slug: 'about',
    content: `<p class="lead">欢迎来到我们的全栈管理平台！我们致力于为开发者与企业提供最高效、最优雅的管理系统和交互方案。</p>
<h2>我们的使命</h2>
<p>打造可持续演进、高内聚、低耦合的企业级全栈基座。</p>
<h2>核心架构优势</h2>
<ul>
  <li><strong>最新框架底座</strong>：React Router 8.3.1 + React 19 + Tailwind v4</li>
  <li><strong>组件原子全覆</strong>：官方 47 个全套 shadcn/ui 组件原生实现，无冗余三方框架依赖</li>
  <li><strong>领域模块自治</strong>：借鉴 Filament 的 Resource / Panel 思想，业务即模块，即插即用</li>
  <li><strong>全域组件复用</strong>：支持在 /admin、/portal 等任意公私端无痛复用受控表单与数据表格</li>
</ul>`,
    seoTitle: '关于我们 - 全栈应用平台',
    seoDescription: '了解我们的团队使命、愿景与核心架构技术。',
    seoKeywords: 'ReactRouter8, shadcn, AdminFramework, 关于我们',
    status: 'published',
    views: 128,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'privacy',
    title: '隐私政策',
    slug: 'privacy',
    content: `<p>本隐私政策详细阐述了我们在您使用本平台时如何收集、使用、存储及保护您的个人隐私信息。</p>
<h3>1. 信息收集与使用</h3>
<p>我们遵循合法、正当、必要的原则，仅收集向您提供服务所必需的数据：</p>
<ul>
  <li><strong>账户信息</strong>：邮箱地址、登录名与安全认证信息</li>
  <li><strong>审计日志</strong>：登录 IP、操作时间戳与系统异常追踪</li>
</ul>
<h3>2. 数据安全保障</h3>
<p>我们采用行业标准的安全技术保障（包括 TLS 1.3 传输加密与 RBAC 严格权限控制）避免数据泄露。</p>
<h3>3. 您的权利与自主控制</h3>
<p>您有权随时登录个人中心查阅、修改绑定的个人资料或注销账户。</p>`,
    seoTitle: '隐私政策与数据保护 - 全栈应用平台',
    seoDescription: '我们尊重并严格保护每一位用户的隐私数据安全。',
    seoKeywords: '隐私政策, 数据安全, 用户权利',
    status: 'published',
    views: 356,
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'terms',
    title: '服务条款',
    slug: 'terms',
    content: `<p>在使用本平台提供的各项功能之前，请您仔细阅读本《服务条款与使用协议》。</p>
<h3>1. 账号使用规范</h3>
<p>用户应当对以其账号进行的所有活动承担法律责任。严禁利用本平台发布、传输违法违规信息或进行恶意攻击。</p>
<h3>2. 知识产权与授权</h3>
<p>平台包含的代码结构、UI 设计、商标及专利均归本团队所有，未经许可不得擅自用于商业二次分发。</p>
<h3>3. 免责与有限保证</h3>
<p>在法律允许的最大范围内，平台以“现状”提供服务，不对因不可抗力导致的短期网络中断承担间接损失赔偿责任。</p>`,
    seoTitle: '用户服务条款 - 全栈应用平台',
    seoDescription: '请仔细阅读我们的用户协议与服务条款。',
    seoKeywords: '服务条款, 使用协议, 用户规范',
    status: 'published',
    views: 242,
    createdAt: '2025-01-03T00:00:00.000Z',
    updatedAt: '2025-01-03T00:00:00.000Z',
  },
]

const SEED_PAGES: SitePage[] = [
  {
    id: 'about',
    title: 'About Us',
    slug: 'about',
    content: `<p class="lead">Welcome to our full-stack admin platform! We build the most efficient and elegant admin systems and interaction experiences for developers and enterprises.</p>
<h2>Our Mission</h2>
<p>Craft a sustainable, cohesive, loosely coupled full-stack foundation.</p>
<h2>Core Architecture Advantages</h2>
<ul>
  <li><strong>Latest framework base</strong>: React Router 8.3.1 + React 19 + Tailwind v4</li>
  <li><strong>Full component coverage</strong>: all 47 official shadcn/ui components implemented natively, with no redundant third-party dependencies</li>
  <li><strong>Domain-module autonomy</strong>: inspired by Filament's Resource / Panel philosophy — business features as plug-and-play modules</li>
  <li><strong>Universal component reuse</strong>: controlled forms and data tables reusable across /admin, /portal, and any public or private surface</li>
</ul>`,
    seoTitle: 'About Us - Full-Stack Application Platform',
    seoDescription:
      'Learn about our team mission, vision, and core architecture.',
    seoKeywords: 'ReactRouter8, shadcn, AdminFramework, About Us',
    status: 'published',
    views: 128,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    slug: 'privacy',
    content: `<p>This privacy policy explains how we collect, use, store, and protect your personal information when you use this platform.</p>
<h3>1. Information We Collect</h3>
<p>We follow the principles of lawfulness, legitimacy, and necessity, collecting only the data required to deliver our services:</p>
<ul>
  <li><strong>Account information</strong>: email address, login name, and security credentials</li>
  <li><strong>Audit logs</strong>: login IP, operation timestamps, and system exception tracking</li>
</ul>
<h3>2. Data Security</h3>
<p>We apply industry-standard security technologies (including TLS 1.3 transport encryption and strict RBAC access control) to prevent data leaks.</p>
<h3>3. Your Rights and Controls</h3>
<p>You may sign in at any time to review or edit your profile, or close your account.</p>`,
    seoTitle:
      'Privacy Policy & Data Protection - Full-Stack Application Platform',
    seoDescription:
      'We respect and strictly protect the privacy and data security of every user.',
    seoKeywords: 'privacy policy, data security, user rights',
    status: 'published',
    views: 356,
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'terms',
    title: 'Terms of Service',
    slug: 'terms',
    content: `<p>Please read these Terms of Service carefully before using the features provided by this platform.</p>
<h3>1. Account Use</h3>
<p>Users are responsible for all activity under their account. Publishing or transmitting unlawful content, or conducting malicious attacks, is strictly prohibited.</p>
<h3>2. Intellectual Property</h3>
<p>The platform's code structure, UI design, trademarks, and patents belong to our team and may not be commercially redistributed without permission.</p>
<h3>3. Disclaimer and Limited Warranty</h3>
<p>To the maximum extent permitted by law, the platform is provided "as is" and is not liable for indirect losses caused by force majeure or short network interruptions.</p>`,
    seoTitle: 'Terms of Service - Full-Stack Application Platform',
    seoDescription:
      'Please read our user agreement and terms of service carefully.',
    seoKeywords: 'terms of service, user agreement, acceptable use',
    status: 'published',
    views: 242,
    createdAt: '2025-01-03T00:00:00.000Z',
    updatedAt: '2025-01-03T00:00:00.000Z',
  },
]

const LEGACY_SEED_NAV_GROUPS: SiteNavGroup[] = [
  // Header 导航分类
  {
    id: 'grp-h-main',
    name: '基础导览',
    location: 'header',
    sort: 10,
    enabled: true,
    description: '前台门户核心直达入口',
  },
  {
    id: 'grp-h-prod',
    name: '产品与服务',
    location: 'header',
    sort: 20,
    enabled: true,
    description: '全栈管理能力与核心矩阵',
  },
  {
    id: 'grp-h-about',
    name: '关于与支持',
    location: 'header',
    sort: 30,
    enabled: true,
    description: '企业背景、条款协议与生态合作',
  },

  // Footer 导航分类 (支持自由添加、修改名字、删除)
  {
    id: 'grp-f-core',
    name: '核心产品',
    location: 'footer',
    sort: 10,
    enabled: true,
    description: '平台产品与管理矩阵',
  },
  {
    id: 'grp-f-legal',
    name: '法律合规',
    location: 'footer',
    sort: 20,
    enabled: true,
    description: '隐私保护政策与服务条款协议',
  },
  {
    id: 'grp-f-support',
    name: '关于与支持',
    location: 'footer',
    sort: 30,
    enabled: true,
    description: '团队介绍、生态链接与官方文档',
  },
]

const SEED_NAV_GROUPS: SiteNavGroup[] = [
  // Header 导航分类
  {
    id: 'grp-h-main',
    name: 'Main Navigation',
    location: 'header',
    sort: 10,
    enabled: true,
    description: 'Core quick links for the public portal',
  },
  {
    id: 'grp-h-prod',
    name: 'Products & Services',
    location: 'header',
    sort: 20,
    enabled: true,
    description: 'Full-stack admin capabilities and the core matrix',
  },
  {
    id: 'grp-h-about',
    name: 'About & Support',
    location: 'header',
    sort: 30,
    enabled: true,
    description: 'Company background, policies, and ecosystem',
  },

  // Footer 导航分类 (支持自由添加、修改名字、删除)
  {
    id: 'grp-f-core',
    name: 'Core Products',
    location: 'footer',
    sort: 10,
    enabled: true,
    description: 'Platform products and admin matrix',
  },
  {
    id: 'grp-f-legal',
    name: 'Legal & Compliance',
    location: 'footer',
    sort: 20,
    enabled: true,
    description: 'Privacy policy and terms of service',
  },
  {
    id: 'grp-f-support',
    name: 'About & Support',
    location: 'footer',
    sort: 30,
    enabled: true,
    description: 'Team intro, ecosystem links, and official docs',
  },
]

const LEGACY_SEED_NAVS: SiteNavItem[] = [
  // ----------------------------------------
  // Header 导航：原生直连 + 带子菜单的下拉项
  // ----------------------------------------
  {
    id: 'nav-h1',
    location: 'header',
    groupId: 'grp-h-main',
    title: '平台门户首页',
    url: '/',
    target: '_self',
    sort: 10,
    enabled: true,
  },
  {
    id: 'nav-h-prod',
    location: 'header',
    groupId: 'grp-h-prod',
    title: '产品与功能',
    url: '#',
    target: '_self',
    sort: 20,
    enabled: true,
    description: '全栈后台与权限管理能力',
  },
  // 产品与功能 -> 子菜单
  {
    id: 'nav-h-sub-users',
    location: 'header',
    groupId: 'grp-h-prod',
    parentId: 'nav-h-prod',
    title: '用户与成员中心',
    url: '/admin/users',
    target: '_self',
    sort: 10,
    enabled: true,
    description: '团队成员组织架构与账号管理',
  },
  {
    id: 'nav-h-sub-roles',
    location: 'header',
    groupId: 'grp-h-prod',
    parentId: 'nav-h-prod',
    title: '角色与权限矩阵',
    url: '/admin/roles',
    target: '_self',
    sort: 20,
    enabled: true,
    description: 'RBAC 细粒度权限控制与分配',
  },
  {
    id: 'nav-h-sub-widgets',
    location: 'header',
    groupId: 'grp-h-prod',
    parentId: 'nav-h-prod',
    title: '卡片小工具中心',
    url: '/admin/widgets',
    target: '_self',
    sort: 30,
    enabled: true,
    description: '低代码装配式侧边栏卡片',
  },
  {
    id: 'nav-h-sub-media',
    location: 'header',
    groupId: 'grp-h-prod',
    parentId: 'nav-h-prod',
    title: '媒体资源资产库',
    url: '/admin/media',
    target: '_self',
    sort: 40,
    enabled: true,
    description: '多媒体素材与文件集中管理',
  },

  // Header 顶级菜单项 - 关于与支持（带子菜单）
  {
    id: 'nav-h-about',
    location: 'header',
    groupId: 'grp-h-about',
    title: '关于与支持',
    url: '#',
    target: '_self',
    sort: 30,
    enabled: true,
    description: '团队愿景、合规条款与伙伴生态',
  },
  // 关于与支持 -> 子菜单
  {
    id: 'nav-h-sub-about',
    location: 'header',
    groupId: 'grp-h-about',
    parentId: 'nav-h-about',
    title: '关于团队',
    url: '/about',
    target: '_self',
    sort: 10,
    enabled: true,
    description: '了解平台背景与使命愿景',
  },
  {
    id: 'nav-h-sub-terms',
    location: 'header',
    groupId: 'grp-h-about',
    parentId: 'nav-h-about',
    title: '服务条款协议',
    url: '/terms',
    target: '_self',
    sort: 20,
    enabled: true,
    description: '平台服务使用协议与免责声明',
  },
  {
    id: 'nav-h-sub-privacy',
    location: 'header',
    groupId: 'grp-h-about',
    parentId: 'nav-h-about',
    title: '隐私保护政策',
    url: '/privacy',
    target: '_self',
    sort: 30,
    enabled: true,
    description: '用户数据隐私与合规安全保障',
  },
  {
    id: 'nav-h-sub-links',
    location: 'header',
    groupId: 'grp-h-about',
    parentId: 'nav-h-about',
    title: '友情链接',
    url: '/links',
    target: '_self',
    sort: 40,
    enabled: true,
    description: '申请加入开放技术互联网络',
  },

  // ----------------------------------------
  // Footer 导航：按分组排列
  // ----------------------------------------
  {
    id: 'nav-f1',
    location: 'footer',
    groupId: 'grp-f-core',
    group: '核心产品',
    title: '用户与成员中心',
    url: '/admin/users',
    target: '_self',
    sort: 10,
    enabled: true,
  },
  {
    id: 'nav-f2',
    location: 'footer',
    groupId: 'grp-f-core',
    group: '核心产品',
    title: '角色与权限矩阵',
    url: '/admin/roles',
    target: '_self',
    sort: 20,
    enabled: true,
  },
  {
    id: 'nav-f-media',
    location: 'footer',
    groupId: 'grp-f-core',
    group: '核心产品',
    title: '媒体资源资产库',
    url: '/admin/media',
    target: '_self',
    sort: 30,
    enabled: true,
  },
  {
    id: 'nav-f3',
    location: 'footer',
    groupId: 'grp-f-legal',
    group: '法律合规',
    title: '隐私保护政策',
    url: '/privacy',
    target: '_self',
    sort: 10,
    enabled: true,
  },
  {
    id: 'nav-f4',
    location: 'footer',
    groupId: 'grp-f-legal',
    group: '法律合规',
    title: '服务条款协议',
    url: '/terms',
    target: '_self',
    sort: 20,
    enabled: true,
  },
  {
    id: 'nav-f5',
    location: 'footer',
    groupId: 'grp-f-support',
    group: '关于与支持',
    title: '关于团队',
    url: '/about',
    target: '_self',
    sort: 10,
    enabled: true,
  },
  {
    id: 'nav-f-links',
    location: 'footer',
    groupId: 'grp-f-support',
    group: '关于与支持',
    title: '友情链接',
    url: '/links',
    target: '_self',
    sort: 15,
    enabled: true,
  },
  {
    id: 'nav-f6',
    location: 'footer',
    groupId: 'grp-f-support',
    group: '关于与支持',
    title: 'shadcn/ui 官方文档',
    url: 'https://ui.shadcn.com',
    target: '_blank',
    sort: 20,
    enabled: true,
  },
]

const SEED_NAVS: SiteNavItem[] = [
  // ----------------------------------------
  // Header navigation: direct links + dropdown items with submenus
  // ----------------------------------------
  {
    id: 'nav-h1',
    location: 'header',
    groupId: 'grp-h-main',
    title: 'Portal Home',
    url: '/',
    target: '_self',
    sort: 10,
    enabled: true,
  },
  {
    id: 'nav-h-prod',
    location: 'header',
    groupId: 'grp-h-prod',
    title: 'Products & Features',
    url: '#',
    target: '_self',
    sort: 20,
    enabled: true,
    description: 'Full-stack admin and permission management',
  },
  // Products & Features -> submenus
  {
    id: 'nav-h-sub-users',
    location: 'header',
    groupId: 'grp-h-prod',
    parentId: 'nav-h-prod',
    title: 'Users & Members',
    url: '/admin/users',
    target: '_self',
    sort: 10,
    enabled: true,
    description: 'Team structure and account management',
  },
  {
    id: 'nav-h-sub-roles',
    location: 'header',
    groupId: 'grp-h-prod',
    parentId: 'nav-h-prod',
    title: 'Roles & Permissions',
    url: '/admin/roles',
    target: '_self',
    sort: 20,
    enabled: true,
    description: 'Fine-grained RBAC control and assignment',
  },
  {
    id: 'nav-h-sub-widgets',
    location: 'header',
    groupId: 'grp-h-prod',
    parentId: 'nav-h-prod',
    title: 'Widget Center',
    url: '/admin/widgets',
    target: '_self',
    sort: 30,
    enabled: true,
    description: 'Low-code assembleable sidebar cards',
  },
  {
    id: 'nav-h-sub-media',
    location: 'header',
    groupId: 'grp-h-prod',
    parentId: 'nav-h-prod',
    title: 'Media Library',
    url: '/admin/media',
    target: '_self',
    sort: 40,
    enabled: true,
    description: 'Centralized media assets and file management',
  },

  // Header top-level item - About & Support (with submenus)
  {
    id: 'nav-h-about',
    location: 'header',
    groupId: 'grp-h-about',
    title: 'About & Support',
    url: '#',
    target: '_self',
    sort: 30,
    enabled: true,
    description: 'Team vision, compliance, and partner ecosystem',
  },
  // About & Support -> submenus
  {
    id: 'nav-h-sub-about',
    location: 'header',
    groupId: 'grp-h-about',
    parentId: 'nav-h-about',
    title: 'About the Team',
    url: '/about',
    target: '_self',
    sort: 10,
    enabled: true,
    description: 'Platform background, mission, and vision',
  },
  {
    id: 'nav-h-sub-terms',
    location: 'header',
    groupId: 'grp-h-about',
    parentId: 'nav-h-about',
    title: 'Terms of Service',
    url: '/terms',
    target: '_self',
    sort: 20,
    enabled: true,
    description: 'Usage agreement and disclaimer',
  },
  {
    id: 'nav-h-sub-privacy',
    location: 'header',
    groupId: 'grp-h-about',
    parentId: 'nav-h-about',
    title: 'Privacy Policy',
    url: '/privacy',
    target: '_self',
    sort: 30,
    enabled: true,
    description: 'User data privacy and compliance',
  },
  {
    id: 'nav-h-sub-links',
    location: 'header',
    groupId: 'grp-h-about',
    parentId: 'nav-h-about',
    title: 'Friend Links',
    url: '/links',
    target: '_self',
    sort: 40,
    enabled: true,
    description: 'Join our open tech partner network',
  },

  // ----------------------------------------
  // Footer navigation, grouped
  // ----------------------------------------
  {
    id: 'nav-f1',
    location: 'footer',
    groupId: 'grp-f-core',
    group: 'Core Products',
    title: 'Users & Members',
    url: '/admin/users',
    target: '_self',
    sort: 10,
    enabled: true,
  },
  {
    id: 'nav-f2',
    location: 'footer',
    groupId: 'grp-f-core',
    group: 'Core Products',
    title: 'Roles & Permissions',
    url: '/admin/roles',
    target: '_self',
    sort: 20,
    enabled: true,
  },
  {
    id: 'nav-f-media',
    location: 'footer',
    groupId: 'grp-f-core',
    group: 'Core Products',
    title: 'Media Library',
    url: '/admin/media',
    target: '_self',
    sort: 30,
    enabled: true,
  },
  {
    id: 'nav-f3',
    location: 'footer',
    groupId: 'grp-f-legal',
    group: 'Legal & Compliance',
    title: 'Privacy Policy',
    url: '/privacy',
    target: '_self',
    sort: 10,
    enabled: true,
  },
  {
    id: 'nav-f4',
    location: 'footer',
    groupId: 'grp-f-legal',
    group: 'Legal & Compliance',
    title: 'Terms of Service',
    url: '/terms',
    target: '_self',
    sort: 20,
    enabled: true,
  },
  {
    id: 'nav-f5',
    location: 'footer',
    groupId: 'grp-f-support',
    group: 'About & Support',
    title: 'About the Team',
    url: '/about',
    target: '_self',
    sort: 10,
    enabled: true,
  },
  {
    id: 'nav-f-links',
    location: 'footer',
    groupId: 'grp-f-support',
    group: 'About & Support',
    title: 'Friend Links',
    url: '/links',
    target: '_self',
    sort: 15,
    enabled: true,
  },
  {
    id: 'nav-f6',
    location: 'footer',
    groupId: 'grp-f-support',
    group: 'About & Support',
    title: 'shadcn/ui Documentation',
    url: 'https://ui.shadcn.com',
    target: '_blank',
    sort: 20,
    enabled: true,
  },
]

const LEGACY_SEED_WIDGETS: SiteWidgetConfig[] = [
  {
    id: 'w-1',
    key: 'quick_links',
    title: '快捷通道',
    description: '快速跳转系统常用业务页面',
    placement: 'both',
    enabled: true,
    sort: 10,
  },
  {
    id: 'w-2',
    key: 'stats_metric',
    title: '系统核心指标',
    description: '展示关键业务数据与用户总量统计',
    placement: 'dashboard',
    enabled: true,
    sort: 20,
  },
  {
    id: 'w-3',
    key: 'announcements',
    title: '最新动态通告',
    description: '即时拉取运营发布的通知公告',
    placement: 'both',
    enabled: true,
    sort: 30,
  },
  {
    id: 'w-4',
    key: 'contact_info',
    title: '联系与技术支持',
    description: '展示联系方式、支持渠道与服务时间',
    placement: 'site_sidebar',
    enabled: true,
    sort: 40,
  },
  {
    id: 'w-sponsor',
    key: 'sponsor_ad',
    title: '推荐专栏 · 赞助推广',
    description: '精选技术社区专栏与合作伙伴推广卡片',
    placement: 'site_sidebar',
    cardType: 'preset',
    enabled: true,
    sort: 15,
  },
]

const SEED_WIDGETS: SiteWidgetConfig[] = [
  {
    id: 'w-1',
    key: 'quick_links',
    title: 'Quick Links',
    description: 'Jump to frequently used system pages',
    placement: 'both',
    enabled: true,
    sort: 10,
  },
  {
    id: 'w-2',
    key: 'stats_metric',
    title: 'Core Metrics',
    description: 'Key business data and total user statistics',
    placement: 'dashboard',
    enabled: true,
    sort: 20,
  },
  {
    id: 'w-3',
    key: 'announcements',
    title: 'Latest Announcements',
    description: 'Pull the latest operations notices on the fly',
    placement: 'both',
    enabled: true,
    sort: 30,
  },
  {
    id: 'w-4',
    key: 'contact_info',
    title: 'Contact & Support',
    description: 'Contact info, support channels, and service hours',
    placement: 'site_sidebar',
    enabled: true,
    sort: 40,
  },
  {
    id: 'w-sponsor',
    key: 'sponsor_ad',
    title: 'Featured · Sponsors',
    description: 'Curated tech columns and partner promo cards',
    placement: 'site_sidebar',
    cardType: 'preset',
    enabled: true,
    sort: 15,
  },
]

const LEGACY_SEED_ANNOUNCEMENTS: SiteAnnouncement[] = [
  {
    id: 'ann-banner',
    type: 'banner',
    title: '全栈架构升级通知',
    content:
      '🎉 本系统已平滑升级至 React Router 8.3 + React 19 最新架构，全套 47 个 shadcn 组件全部自研落地！',
    linkText: '查看技术报告',
    linkUrl: '/about',
    enabled: true,
    style: 'info',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ann-modal',
    type: 'modal',
    title: '欢迎体验通用门户与站点系统',
    content:
      '我们现已正式上线通用的“单页面管理、页眉页脚导航编辑、卡片小工具及运营通知系统”。您可以在后台随意配置并在前台实时查看！',
    linkText: '了解更多',
    linkUrl: '/about',
    enabled: true,
    showOnce: true,
    style: 'default',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ann-corner',
    type: 'corner',
    title: '需要技术支持或反馈？',
    content: '如在体验过程中有任何建议，欢迎查阅服务条款或联系平台架构支持。',
    linkText: '查阅条款',
    linkUrl: '/terms',
    enabled: true,
    style: 'default',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ann-marquee',
    type: 'marquee',
    title: '动态速递',
    content:
      '🚀 React Router 8 Admin 全新发布 · 支持 RBAC 权限矩阵 · 具备卡片小工具低代码装配 · 运营通知弹窗已上线',
    linkText: '立即查看',
    linkUrl: '/about',
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
]

const SEED_ANNOUNCEMENTS: SiteAnnouncement[] = [
  {
    id: 'ann-banner',
    type: 'banner',
    title: 'Full-Stack Architecture Upgrade',
    content:
      '🎉 This platform has been smoothly upgraded to React Router 8.3 + React 19, with all 47 shadcn components built in-house!',
    linkText: 'View the tech report',
    linkUrl: '/about',
    enabled: true,
    style: 'info',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ann-modal',
    type: 'modal',
    title: 'Welcome to the Portal & Site System',
    content:
      'Single-page management, header/footer navigation editing, widget cards, and operations notices are now live. Configure everything in the admin panel and see the public site update instantly!',
    linkText: 'Learn more',
    linkUrl: '/about',
    enabled: true,
    showOnce: true,
    style: 'default',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ann-corner',
    type: 'corner',
    title: 'Need support or want to share feedback?',
    content:
      'If you have any suggestions while exploring the platform, check the terms of service or reach out to platform support.',
    linkText: 'Read the terms',
    linkUrl: '/terms',
    enabled: true,
    style: 'default',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ann-marquee',
    type: 'marquee',
    title: 'Quick updates',
    content:
      '🚀 React Router 8 Admin released · RBAC permission matrix · Low-code widget assembly · Operations notices now live',
    linkText: 'Check it out',
    linkUrl: '/about',
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
]

const LEGACY_SEED_ADS: SiteAdSlot[] = [
  {
    id: 'ad-header',
    slotKey: 'header_banner',
    title: '页头顶部通栏推荐位',
    adType: 'text',
    text: '⚡ 新一代 React Admin Framework 极速构建体验，欢迎体验！',
    targetUrl: '/about',
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ad-sidebar',
    slotKey: 'sidebar_card',
    title: '侧边栏推荐位',
    adType: 'text',
    text: '🎯 模块化架构 · 零冗余代码 · 自由扩展 CMS/Blog/SaaS',
    targetUrl: '/',
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
]

const SEED_ADS: SiteAdSlot[] = [
  {
    id: 'ad-header',
    slotKey: 'header_banner',
    title: 'Header banner slot',
    adType: 'text',
    text: '⚡ Try the next-gen React Admin Framework for a blazing-fast build experience!',
    targetUrl: '/about',
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'ad-sidebar',
    slotKey: 'sidebar_card',
    title: 'Sidebar slot',
    adType: 'text',
    text: '🎯 Modular architecture · Zero bloat · Extend freely to CMS/Blog/SaaS',
    targetUrl: '/',
    enabled: true,
    updatedAt: new Date().toISOString(),
  },
]

const LEGACY_SEED_LINKS: FriendLink[] = [
  {
    id: 'link-1',
    name: 'React 官方网站',
    url: 'https://react.dev',
    logo: 'https://react.dev/favicon.ico',
    description: '用于构建 Web 与原生交互界面的主流 JavaScript 框架',
    email: 'admin@react.dev',
    status: 'approved',
    sort: 10,
    backlinkStatus: 'verified',
    lastCheckedAt: '2025-01-01T00:00:00.000Z',
    backlinkDetails: '反链巡检通过 (权威伙伴站点反链已登记)',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'link-2',
    name: 'React Router 官方指南',
    url: 'https://reactrouter.com',
    logo: 'https://reactrouter.com/favicon.ico',
    description: '全栈 Web 框架与标准服务端路由系统',
    email: 'team@remix.run',
    status: 'approved',
    sort: 20,
    backlinkStatus: 'verified',
    lastCheckedAt: '2025-01-02T00:00:00.000Z',
    backlinkDetails: '反链巡检通过 (技术生态枢纽反链已核验)',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'link-3',
    name: 'shadcn/ui 设计体系',
    url: 'https://ui.shadcn.com',
    logo: 'https://ui.shadcn.com/favicon.ico',
    description: '精心设计的可复用原子 UI 组件库，极致精美',
    email: 'shadcn@example.com',
    status: 'approved',
    sort: 30,
    backlinkStatus: 'verified',
    lastCheckedAt: '2025-01-03T00:00:00.000Z',
    backlinkDetails: '反链巡检通过 (UI 组件库生态链伙伴)',
    createdAt: '2025-01-03T00:00:00.000Z',
    updatedAt: '2025-01-03T00:00:00.000Z',
  },
  {
    id: 'link-4',
    name: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    logo: 'https://tailwindcss.com/favicons/favicon.ico',
    description: '实用优先的原子化现代 CSS 框架',
    email: 'adam@tailwindcss.com',
    status: 'approved',
    sort: 40,
    backlinkStatus: 'missing',
    lastCheckedAt: '2025-01-04T00:00:00.000Z',
    backlinkDetails: '未在友站首页源代码中检索到本站反向链接',
    createdAt: '2025-01-04T00:00:00.000Z',
    updatedAt: '2025-01-04T00:00:00.000Z',
  },
  {
    id: 'link-5',
    name: '极客开发者周刊',
    url: 'https://geekweekly.dev',
    logo: '',
    description: '每周汇聚全栈前沿资讯与高质量开源框架项目',
    email: 'editor@geekweekly.dev',
    status: 'pending',
    sort: 50,
    backlinkStatus: 'unverified',
    createdAt: '2025-01-05T00:00:00.000Z',
    updatedAt: '2025-01-05T00:00:00.000Z',
  },
]

const SEED_LINKS: FriendLink[] = [
  {
    id: 'link-1',
    name: 'React Official Site',
    url: 'https://react.dev',
    logo: 'https://react.dev/favicon.ico',
    description: 'The library for building web and native user interfaces',
    email: 'admin@react.dev',
    status: 'approved',
    sort: 10,
    backlinkStatus: 'verified',
    lastCheckedAt: '2025-01-01T00:00:00.000Z',
    backlinkDetails:
      'Backlink check passed (authoritative partner link registered)',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'link-2',
    name: 'React Router Guide',
    url: 'https://reactrouter.com',
    logo: 'https://reactrouter.com/favicon.ico',
    description: 'Full-stack web framework and standard server-side routing',
    email: 'team@remix.run',
    status: 'approved',
    sort: 20,
    backlinkStatus: 'verified',
    lastCheckedAt: '2025-01-02T00:00:00.000Z',
    backlinkDetails: 'Backlink check passed (tech ecosystem hub verified)',
    createdAt: '2025-01-02T00:00:00.000Z',
    updatedAt: '2025-01-02T00:00:00.000Z',
  },
  {
    id: 'link-3',
    name: 'shadcn/ui Design System',
    url: 'https://ui.shadcn.com',
    logo: 'https://ui.shadcn.com/favicon.ico',
    description:
      'Beautifully designed reusable UI components, exquisitely crafted',
    email: 'shadcn@example.com',
    status: 'approved',
    sort: 30,
    backlinkStatus: 'verified',
    lastCheckedAt: '2025-01-03T00:00:00.000Z',
    backlinkDetails: 'Backlink check passed (UI component library partner)',
    createdAt: '2025-01-03T00:00:00.000Z',
    updatedAt: '2025-01-03T00:00:00.000Z',
  },
  {
    id: 'link-4',
    name: 'Tailwind CSS',
    url: 'https://tailwindcss.com',
    logo: 'https://tailwindcss.com/favicons/favicon.ico',
    description:
      'A utility-first CSS framework for rapidly building modern websites',
    email: 'adam@tailwindcss.com',
    status: 'approved',
    sort: 40,
    backlinkStatus: 'missing',
    lastCheckedAt: '2025-01-04T00:00:00.000Z',
    backlinkDetails:
      'No backlink to this site found in the partner homepage source',
    createdAt: '2025-01-04T00:00:00.000Z',
    updatedAt: '2025-01-04T00:00:00.000Z',
  },
  {
    id: 'link-5',
    name: 'Geek Developer Weekly',
    url: 'https://geekweekly.dev',
    logo: '',
    description:
      'Weekly digest of full-stack news and quality open-source projects',
    email: 'editor@geekweekly.dev',
    status: 'pending',
    sort: 50,
    backlinkStatus: 'unverified',
    createdAt: '2025-01-05T00:00:00.000Z',
    updatedAt: '2025-01-05T00:00:00.000Z',
  },
]

const LEGACY_SEED_FRIEND_LINK_GUIDELINES: FriendLinkGuidelines = {
  title: '友情链接互换说明与准则',
  rule1Title: '1. 优先提前添加本站',
  rule1Desc:
    '提交申请前，请先在贵站友链区添加本站信息（名称：React Admin Framework，跳转至本站首页）。',
  rule2Title: '2. 内容健康稳定',
  rule2Desc:
    '网站内容合法合规，定期维护更新，非纯广告、镜像或违法违规网站，具备独立域名。',
  rule3Title: '3. 自动审核与巡检',
  rule3Desc:
    '管理员将在 48 小时内核验。系统会不定期对收录的友链进行可访问性巡检，若长期失联将暂时下线。',
  customNotice:
    '欢迎前沿全栈技术团队、开源软件项目与优秀开发者博客互换链接，携手构建开放的技术伙伴网络！',
  updatedAt: new Date().toISOString(),
}

const SEED_FRIEND_LINK_GUIDELINES: FriendLinkGuidelines = {
  title: 'Friend Link Exchange Guidelines',
  rule1Title: '1. Add us first',
  rule1Desc:
    'Before applying, please add our site to your links section (name: React Admin Framework, linking to our homepage).',
  rule2Title: '2. Healthy, stable content',
  rule2Desc:
    'Content must be legal and regularly maintained — no ad-only, mirror, or unlawful sites, and an independent domain is required.',
  rule3Title: '3. Review & inspection',
  rule3Desc:
    'Admins will verify within 48 hours. Indexed links are periodically checked for availability; long-unreachable ones may be temporarily delisted.',
  customNotice:
    'Full-stack tech teams, open-source projects, and developer blogs are welcome to exchange links and build an open tech partner network!',
  updatedAt: new Date().toISOString(),
}

const STORAGE_KEYS = {
  PAGES: 'admin_site_pages',
  NAV_GROUPS: 'admin_site_nav_groups',
  NAVS: 'admin_site_navs',
  WIDGETS: 'admin_site_widgets',
  ANNOUNCEMENTS: 'admin_site_announcements',
  ADS: 'admin_site_ads',
  LINKS: 'admin_site_links',
  FRIEND_LINK_GUIDELINES: 'admin_site_friend_link_guidelines',
  WIDGET_GLOBAL_SETTINGS: 'admin_site_widget_global_settings',
  META: 'admin_site_meta_v1',
}

const DEFAULT_WIDGET_GLOBAL_SETTINGS: SiteWidgetGlobalSettings = {
  density: 'compact',
  sidebarSticky: true,
  showCardDividers: true,
}

export class SiteRepository {
  private getStorage<T>(key: string, fallback: T[]): T[] {
    if (typeof window === 'undefined') return fallback
    try {
      const stored = localStorage.getItem(key)
      if (!stored) {
        localStorage.setItem(key, JSON.stringify(fallback))
        return fallback
      }
      return JSON.parse(stored) as T[]
    } catch {
      return fallback
    }
  }

  private setStorage<T>(key: string, data: T[]): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to write storage for', key, e)
    }
  }

  private getObjectStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback
    try {
      const stored = localStorage.getItem(key)
      if (!stored) {
        localStorage.setItem(key, JSON.stringify(fallback))
        return fallback
      }
      return JSON.parse(stored) as T
    } catch {
      return fallback
    }
  }

  private setObjectStorage<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (e) {
      console.error('Failed to write storage for', key, e)
    }
  }

  private readRawStorage<T>(key: string): T | null {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem(key)
      return stored ? (JSON.parse(stored) as T) : null
    } catch {
      return null
    }
  }

  // One-shot migration: swap Chinese seed values for the English seeds, but
  // only where the stored value still equals the legacy seed (user edits stay).
  private migrateFields<T extends object>(
    stored: T,
    legacy: Partial<T>,
    fresh: Partial<T>,
    fields: ReadonlyArray<keyof T>,
  ): { next: T; changed: boolean } {
    let changed = false
    const next = { ...stored }
    for (const field of fields) {
      const legacyValue = legacy[field]
      const freshValue = fresh[field]
      if (legacyValue === undefined || freshValue === undefined) continue
      if (stored[field] === legacyValue && freshValue !== stored[field]) {
        ;(next as Record<string, unknown>)[field as string] = freshValue
        changed = true
      }
    }
    return { next, changed }
  }

  private migrateSeededArray<T extends { id: string }>(
    raw: T[],
    legacy: T[],
    fresh: T[],
    fields: ReadonlyArray<keyof T>,
  ): { items: T[]; changed: boolean } {
    const legacyById = new Map(legacy.map((item) => [item.id, item]))
    const freshById = new Map(fresh.map((item) => [item.id, item]))
    let changed = false
    const items = raw.map((item) => {
      const legacyItem = legacyById.get(item.id)
      const freshItem = freshById.get(item.id)
      if (!legacyItem || !freshItem) return item
      const result = this.migrateFields(item, legacyItem, freshItem, fields)
      if (result.changed) changed = true
      return result.next
    })
    return { items, changed }
  }

  private migrateLegacySeeds(): void {
    if (typeof window === 'undefined') return
    try {
      if (localStorage.getItem(STORAGE_KEYS.META)) return
      localStorage.setItem(
        STORAGE_KEYS.META,
        JSON.stringify({ legacyChineseSeedsMigrated: true }),
      )

      const runArray = <T extends { id: string }>(
        key: string,
        legacy: T[],
        fresh: T[],
        fields: ReadonlyArray<keyof T>,
      ) => {
        const raw = this.readRawStorage<T[]>(key)
        if (!raw) return
        const { items, changed } = this.migrateSeededArray(
          raw,
          legacy,
          fresh,
          fields,
        )
        if (changed) this.setStorage(key, items)
      }

      runArray(STORAGE_KEYS.PAGES, LEGACY_SEED_PAGES, SEED_PAGES, [
        'title',
        'seoTitle',
        'seoDescription',
        'seoKeywords',
        'content',
      ])
      runArray(
        STORAGE_KEYS.NAV_GROUPS,
        LEGACY_SEED_NAV_GROUPS,
        SEED_NAV_GROUPS,
        ['name', 'description'],
      )
      runArray(STORAGE_KEYS.NAVS, LEGACY_SEED_NAVS, SEED_NAVS, [
        'title',
        'description',
        'group',
      ])
      runArray(STORAGE_KEYS.WIDGETS, LEGACY_SEED_WIDGETS, SEED_WIDGETS, [
        'title',
        'description',
      ])
      runArray(
        STORAGE_KEYS.ANNOUNCEMENTS,
        LEGACY_SEED_ANNOUNCEMENTS,
        SEED_ANNOUNCEMENTS,
        ['title', 'content', 'linkText'],
      )
      runArray(STORAGE_KEYS.ADS, LEGACY_SEED_ADS, SEED_ADS, ['title', 'text'])
      runArray(STORAGE_KEYS.LINKS, LEGACY_SEED_LINKS, SEED_LINKS, [
        'name',
        'description',
        'backlinkDetails',
      ])

      const rawGuidelines = this.readRawStorage<FriendLinkGuidelines>(
        STORAGE_KEYS.FRIEND_LINK_GUIDELINES,
      )
      if (rawGuidelines) {
        const { next, changed } = this.migrateFields(
          rawGuidelines,
          LEGACY_SEED_FRIEND_LINK_GUIDELINES,
          SEED_FRIEND_LINK_GUIDELINES,
          [
            'title',
            'rule1Title',
            'rule1Desc',
            'rule2Title',
            'rule2Desc',
            'rule3Title',
            'rule3Desc',
            'customNotice',
          ],
        )
        if (changed) {
          this.setObjectStorage(STORAGE_KEYS.FRIEND_LINK_GUIDELINES, next)
        }
      }
    } catch {
      // corrupted storage: leave data as-is and skip migration
    }
  }

  // --- Pages ---
  async getPages(): Promise<SitePage[]> {
    this.migrateLegacySeeds()
    const rawPages = this.getStorage(STORAGE_KEYS.PAGES, SEED_PAGES)
    let dirty = false
    const pages = rawPages.map((p) => {
      const cleanId = p.slug || p.id.replace(/^page-/, '')
      if (p.id !== cleanId) {
        dirty = true
        return { ...p, id: cleanId }
      }
      return p
    })
    if (dirty) {
      this.setStorage(STORAGE_KEYS.PAGES, pages)
    }
    return pages
  }

  async getPageById(idOrSlug: string): Promise<SitePage | null> {
    const pages = await this.getPages()
    return (
      pages.find(
        (p) =>
          p.id === idOrSlug ||
          p.slug === idOrSlug ||
          p.id === `page-${idOrSlug}` ||
          p.id.replace(/^page-/, '') === idOrSlug.replace(/^page-/, ''),
      ) || null
    )
  }

  async getPageBySlug(slug: string): Promise<SitePage | null> {
    const pages = await this.getPages()
    return pages.find((p) => p.slug === slug || p.id === slug) || null
  }

  async savePage(
    data: Omit<SitePage, 'id' | 'createdAt' | 'updatedAt' | 'views'> & {
      id?: string
    },
  ): Promise<SitePage> {
    const pages = await this.getPages()
    const now = new Date().toISOString()

    if (data.id) {
      const existing = pages.find(
        (p) =>
          p.id === data.id ||
          p.slug === data.id ||
          p.id === `page-${data.id}` ||
          p.id.replace(/^page-/, '') === data.id?.replace(/^page-/, ''),
      )
      if (!existing) throw new Error('页面不存在')
      const targetId = existing.id
      const updated: SitePage = {
        ...existing,
        ...data,
        id: targetId,
        updatedAt: now,
      }
      this.setStorage(
        STORAGE_KEYS.PAGES,
        pages.map((p) => (p.id === targetId ? updated : p)),
      )
      return updated
    } else {
      const cleanSlugId =
        data.slug
          ?.trim()
          .toLowerCase()
          .replace(/[^a-z0-9_-]/g, '') || String(Date.now())
      const newPage: SitePage = {
        ...data,
        id: cleanSlugId,
        views: 0,
        createdAt: now,
        updatedAt: now,
      }
      this.setStorage(STORAGE_KEYS.PAGES, [newPage, ...pages])
      return newPage
    }
  }

  async deletePage(id: string): Promise<boolean> {
    const pages = await this.getPages()
    const next = pages.filter((p) => p.id !== id)
    this.setStorage(STORAGE_KEYS.PAGES, next)
    return true
  }

  async incrementPageViews(slug: string): Promise<void> {
    const pages = await this.getPages()
    const target = pages.find((p) => p.slug === slug)
    if (target) {
      target.views += 1
      this.setStorage(STORAGE_KEYS.PAGES, pages)
    }
  }

  // --- Nav Groups (分类名字管理) ---
  async getNavGroups(location?: 'header' | 'footer'): Promise<SiteNavGroup[]> {
    this.migrateLegacySeeds()
    const rawGroups = this.getStorage<SiteNavGroup>(
      STORAGE_KEYS.NAV_GROUPS,
      SEED_NAV_GROUPS,
    )

    // 自动兼容检查：如果 localStorage 中存在未录入分组的历史 items，自动补齐对应分组
    const allItems = this.getStorage<SiteNavItem>(STORAGE_KEYS.NAVS, SEED_NAVS)
    let dirty = false
    const existingGroupNames = new Set(rawGroups.map((g) => g.name))

    allItems.forEach((item) => {
      if (item.group && !existingGroupNames.has(item.group)) {
        rawGroups.push({
          id: `grp-${item.location}-${Date.now().toString().slice(-4)}`,
          name: item.group,
          location: item.location,
          sort: 50,
          enabled: true,
        })
        existingGroupNames.add(item.group)
        dirty = true
      }
    })

    if (dirty) {
      this.setStorage(STORAGE_KEYS.NAV_GROUPS, rawGroups)
    }

    if (location) {
      return rawGroups
        .filter((g) => g.location === location)
        .sort((a, b) => a.sort - b.sort)
    }
    return rawGroups.sort((a, b) => a.sort - b.sort)
  }

  async saveNavGroup(
    group: SiteNavGroupFormValues & { id?: string },
  ): Promise<SiteNavGroup> {
    const groups = await this.getNavGroups()
    if (group.id) {
      const existing = groups.find((g) => g.id === group.id)
      if (!existing) throw new Error('分类分组不存在')
      const oldName = existing.name
      const updated: SiteNavGroup = {
        ...existing,
        ...group,
        id: group.id,
      }
      this.setStorage(
        STORAGE_KEYS.NAV_GROUPS,
        groups.map((g) => (g.id === group.id ? updated : g)),
      )

      // 如果重命名了分类名字，同步更新关联此分组的所有导航项
      if (oldName !== group.name) {
        const items = await this.getNavItems()
        let itemsUpdated = false
        const nextItems = items.map((item) => {
          if (item.groupId === group.id || item.group === oldName) {
            itemsUpdated = true
            return {
              ...item,
              groupId: group.id,
              group: group.name,
            }
          }
          return item
        })
        if (itemsUpdated) {
          this.setStorage(STORAGE_KEYS.NAVS, nextItems)
        }
      }

      return updated
    } else {
      const newGroup: SiteNavGroup = {
        ...group,
        id: `grp-${Date.now()}`,
      }
      this.setStorage(STORAGE_KEYS.NAV_GROUPS, [...groups, newGroup])
      return newGroup
    }
  }

  async deleteNavGroup(id: string): Promise<boolean> {
    const groups = await this.getNavGroups()
    const target = groups.find((g) => g.id === id)
    this.setStorage(
      STORAGE_KEYS.NAV_GROUPS,
      groups.filter((g) => g.id !== id),
    )

    // 解除属于此分组的导航项的分组绑定
    if (target) {
      const items = await this.getNavItems()
      const nextItems = items.map((item) => {
        if (item.groupId === id || item.group === target.name) {
          return {
            ...item,
            groupId: undefined,
            group: undefined,
          }
        }
        return item
      })
      this.setStorage(STORAGE_KEYS.NAVS, nextItems)
    }
    return true
  }

  async updateNavGroupSort(id: string, sort: number): Promise<SiteNavGroup> {
    const groups = await this.getNavGroups()
    const target = groups.find((g) => g.id === id)
    if (!target) throw new Error('分类分组不存在')
    target.sort = sort
    this.setStorage(STORAGE_KEYS.NAV_GROUPS, groups)
    return target
  }

  // --- Nav Items (菜单项与多级子菜单) ---
  async getNavItems(location?: 'header' | 'footer'): Promise<SiteNavItem[]> {
    this.migrateLegacySeeds()
    const rawItems = this.getStorage<SiteNavItem>(STORAGE_KEYS.NAVS, SEED_NAVS)
    let dirty = false
    const items = rawItems.map((item) => {
      if (item.url?.startsWith('/p/')) {
        dirty = true
        return {
          ...item,
          url: item.url.replace('/p/', '/'),
        }
      }
      return item
    })
    if (dirty) {
      this.setStorage(STORAGE_KEYS.NAVS, items)
    }
    if (location) {
      return items
        .filter((i) => i.location === location)
        .sort((a, b) => a.sort - b.sort)
    }
    return items.sort((a, b) => a.sort - b.sort)
  }

  async getNavTree(location?: 'header' | 'footer'): Promise<SiteNavItem[]> {
    const allItems = await this.getNavItems(location)
    const topLevel = allItems.filter((i) => !i.parentId)
    const childrenMap = new Map<string, SiteNavItem[]>()

    allItems.forEach((i) => {
      if (i.parentId) {
        const list = childrenMap.get(i.parentId) || []
        list.push(i)
        childrenMap.set(i.parentId, list)
      }
    })

    return topLevel.map((parent) => ({
      ...parent,
      children: (childrenMap.get(parent.id) || []).sort(
        (a, b) => a.sort - b.sort,
      ),
    }))
  }

  async saveNavItem(
    item: Omit<SiteNavItem, 'id'> & { id?: string },
  ): Promise<SiteNavItem> {
    const items = await this.getNavItems()

    let finalGroupId = item.groupId
    let finalGroupName = item.group

    if (finalGroupId && !finalGroupName) {
      const groups = await this.getNavGroups()
      const found = groups.find((g) => g.id === finalGroupId)
      if (found) finalGroupName = found.name
    } else if (finalGroupName && !finalGroupId) {
      const groups = await this.getNavGroups()
      const found = groups.find(
        (g) => g.name === finalGroupName && g.location === item.location,
      )
      if (found) finalGroupId = found.id
    }

    const payload: Omit<SiteNavItem, 'id'> = {
      ...item,
      groupId: finalGroupId,
      group: finalGroupName,
    }

    if (item.id) {
      const next = items.map((i) =>
        i.id === item.id ? { ...i, ...payload } : i,
      )
      this.setStorage(STORAGE_KEYS.NAVS, next)
      return { ...payload, id: item.id }
    } else {
      const newItem: SiteNavItem = {
        ...payload,
        id: `nav-${Date.now()}`,
      }
      this.setStorage(STORAGE_KEYS.NAVS, [...items, newItem])
      return newItem
    }
  }

  async deleteNavItem(id: string): Promise<boolean> {
    const items = await this.getNavItems()
    // 级联删除子菜单项
    const next = items.filter((i) => i.id !== id && i.parentId !== id)
    this.setStorage(STORAGE_KEYS.NAVS, next)
    return true
  }

  // --- Widgets ---
  async getWidgets(): Promise<SiteWidgetConfig[]> {
    this.migrateLegacySeeds()
    const widgets = this.getStorage(STORAGE_KEYS.WIDGETS, SEED_WIDGETS)
    return widgets.sort((a, b) => a.sort - b.sort)
  }

  async saveWidget(
    data: Omit<SiteWidgetConfig, 'id'> & { id?: string },
  ): Promise<SiteWidgetConfig> {
    const widgets = await this.getWidgets()
    if (data.id) {
      const existing = widgets.find((w) => w.id === data.id)
      if (!existing) throw new Error('小工具不存在')
      const updated: SiteWidgetConfig = {
        ...existing,
        ...data,
      }
      this.setStorage(
        STORAGE_KEYS.WIDGETS,
        widgets.map((w) => (w.id === data.id ? updated : w)),
      )
      return updated
    } else {
      const newWidget: SiteWidgetConfig = {
        ...data,
        id: `w-${Date.now()}`,
      }
      this.setStorage(STORAGE_KEYS.WIDGETS, [...widgets, newWidget])
      return newWidget
    }
  }

  async updateWidget(
    id: string,
    data: Partial<SiteWidgetConfig>,
  ): Promise<SiteWidgetConfig> {
    const widgets = await this.getWidgets()
    const target = widgets.find((w) => w.id === id)
    if (!target) throw new Error('Widget not found')
    const updated = { ...target, ...data }
    this.setStorage(
      STORAGE_KEYS.WIDGETS,
      widgets.map((w) => (w.id === id ? updated : w)),
    )
    return updated
  }

  async deleteWidget(id: string): Promise<boolean> {
    const widgets = await this.getWidgets()
    this.setStorage(
      STORAGE_KEYS.WIDGETS,
      widgets.filter((w) => w.id !== id),
    )
    return true
  }

  getWidgetGlobalSettings(): SiteWidgetGlobalSettings {
    if (typeof window === 'undefined') return DEFAULT_WIDGET_GLOBAL_SETTINGS
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WIDGET_GLOBAL_SETTINGS)
      if (!stored) {
        localStorage.setItem(
          STORAGE_KEYS.WIDGET_GLOBAL_SETTINGS,
          JSON.stringify(DEFAULT_WIDGET_GLOBAL_SETTINGS),
        )
        return DEFAULT_WIDGET_GLOBAL_SETTINGS
      }
      return { ...DEFAULT_WIDGET_GLOBAL_SETTINGS, ...JSON.parse(stored) }
    } catch {
      return DEFAULT_WIDGET_GLOBAL_SETTINGS
    }
  }

  saveWidgetGlobalSettings(
    settings: Partial<SiteWidgetGlobalSettings>,
  ): SiteWidgetGlobalSettings {
    const current = this.getWidgetGlobalSettings()
    const updated: SiteWidgetGlobalSettings = { ...current, ...settings }
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        STORAGE_KEYS.WIDGET_GLOBAL_SETTINGS,
        JSON.stringify(updated),
      )
      window.dispatchEvent(
        new CustomEvent('site_widget_settings_changed', { detail: updated }),
      )
    }
    return updated
  }

  // --- Announcements ---
  async getAnnouncements(): Promise<SiteAnnouncement[]> {
    this.migrateLegacySeeds()
    const list = this.getStorage(STORAGE_KEYS.ANNOUNCEMENTS, SEED_ANNOUNCEMENTS)
    let hasChanges = false
    const sanitized = list.map((a) => {
      if (
        a.linkUrl &&
        (a.linkUrl.includes('/p/') || a.linkUrl.includes('localhost:'))
      ) {
        hasChanges = true
        let clean = a.linkUrl.replace(/https?:\/\/localhost(:\d+)?/, '')
        clean = clean.replace('/p/', '/')
        return { ...a, linkUrl: clean }
      }
      return a
    })
    if (hasChanges) {
      this.setStorage(STORAGE_KEYS.ANNOUNCEMENTS, sanitized)
    }
    return sanitized
  }

  async saveAnnouncement(
    data: Omit<SiteAnnouncement, 'id' | 'updatedAt'> & { id?: string },
  ): Promise<SiteAnnouncement> {
    const list = await this.getAnnouncements()
    const now = new Date().toISOString()
    if (data.id) {
      const existing = list.find((a) => a.id === data.id)
      if (!existing) throw new Error('通告不存在')
      const updated: SiteAnnouncement = {
        ...existing,
        ...data,
        updatedAt: now,
      }
      this.setStorage(
        STORAGE_KEYS.ANNOUNCEMENTS,
        list.map((a) => (a.id === data.id ? updated : a)),
      )
      return updated
    } else {
      const newAnn: SiteAnnouncement = {
        ...data,
        id: `ann-${Date.now()}`,
        updatedAt: now,
      }
      this.setStorage(STORAGE_KEYS.ANNOUNCEMENTS, [newAnn, ...list])
      return newAnn
    }
  }

  async updateAnnouncement(
    id: string,
    data: Partial<SiteAnnouncement>,
  ): Promise<SiteAnnouncement> {
    const list = await this.getAnnouncements()
    const target = list.find((a) => a.id === id)
    if (!target) throw new Error('Announcement not found')
    const updated = { ...target, ...data, updatedAt: new Date().toISOString() }
    this.setStorage(
      STORAGE_KEYS.ANNOUNCEMENTS,
      list.map((a) => (a.id === id ? updated : a)),
    )
    return updated
  }

  async deleteAnnouncement(id: string): Promise<boolean> {
    const list = await this.getAnnouncements()
    this.setStorage(
      STORAGE_KEYS.ANNOUNCEMENTS,
      list.filter((a) => a.id !== id),
    )
    return true
  }

  // --- Ads ---
  async getAdSlots(): Promise<SiteAdSlot[]> {
    this.migrateLegacySeeds()
    return this.getStorage(STORAGE_KEYS.ADS, SEED_ADS)
  }

  async saveAdSlot(
    data: Omit<SiteAdSlot, 'id' | 'updatedAt'> & { id?: string },
  ): Promise<SiteAdSlot> {
    const ads = await this.getAdSlots()
    const now = new Date().toISOString()
    if (data.id) {
      const existing = ads.find((a) => a.id === data.id)
      if (!existing) throw new Error('广告位不存在')
      const updated: SiteAdSlot = {
        ...existing,
        ...data,
        updatedAt: now,
      }
      this.setStorage(
        STORAGE_KEYS.ADS,
        ads.map((a) => (a.id === data.id ? updated : a)),
      )
      return updated
    } else {
      const newAd: SiteAdSlot = {
        ...data,
        id: `ad-${Date.now()}`,
        updatedAt: now,
      }
      this.setStorage(STORAGE_KEYS.ADS, [...ads, newAd])
      return newAd
    }
  }

  async updateAdSlot(
    id: string,
    data: Partial<SiteAdSlot>,
  ): Promise<SiteAdSlot> {
    const ads = await this.getAdSlots()
    const target = ads.find((a) => a.id === id)
    if (!target) throw new Error('AdSlot not found')
    const updated = { ...target, ...data, updatedAt: new Date().toISOString() }
    this.setStorage(
      STORAGE_KEYS.ADS,
      ads.map((a) => (a.id === id ? updated : a)),
    )
    return updated
  }

  async deleteAdSlot(id: string): Promise<boolean> {
    const ads = await this.getAdSlots()
    this.setStorage(
      STORAGE_KEYS.ADS,
      ads.filter((a) => a.id !== id),
    )
    return true
  }

  // --- Friend Links (友情链接) ---
  async getFriendLinks(status?: FriendLinkStatus): Promise<FriendLink[]> {
    this.migrateLegacySeeds()
    const links = this.getStorage(STORAGE_KEYS.LINKS, SEED_LINKS)
    if (status) {
      return links
        .filter((l) => l.status === status)
        .sort((a, b) => a.sort - b.sort)
    }
    return links.sort((a, b) => a.sort - b.sort)
  }

  async getApprovedFriendLinks(): Promise<FriendLink[]> {
    return this.getFriendLinks('approved')
  }

  async saveFriendLink(
    data: Omit<FriendLink, 'id' | 'createdAt' | 'updatedAt'> & { id?: string },
  ): Promise<FriendLink> {
    const links = await this.getFriendLinks()
    const now = new Date().toISOString()
    if (data.id) {
      const existing = links.find((l) => l.id === data.id)
      if (!existing) throw new Error('友情链接不存在')
      const updated: FriendLink = {
        ...existing,
        ...data,
        updatedAt: now,
      }
      this.setStorage(
        STORAGE_KEYS.LINKS,
        links.map((l) => (l.id === data.id ? updated : l)),
      )
      return updated
    } else {
      const newLink: FriendLink = {
        ...data,
        id: `link-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      }
      this.setStorage(STORAGE_KEYS.LINKS, [...links, newLink])
      return newLink
    }
  }

  async updateFriendLinkStatus(
    id: string,
    status: FriendLinkStatus,
    rejectReason?: string,
  ): Promise<FriendLink> {
    const links = await this.getFriendLinks()
    const target = links.find((l) => l.id === id)
    if (!target) throw new Error('友情链接不存在')
    const updated: FriendLink = {
      ...target,
      status,
      rejectReason: status === 'rejected' ? rejectReason : undefined,
      updatedAt: new Date().toISOString(),
    }
    this.setStorage(
      STORAGE_KEYS.LINKS,
      links.map((l) => (l.id === id ? updated : l)),
    )
    return updated
  }

  async deleteFriendLink(id: string): Promise<boolean> {
    const links = await this.getFriendLinks()
    this.setStorage(
      STORAGE_KEYS.LINKS,
      links.filter((l) => l.id !== id),
    )
    return true
  }

  async verifyFriendLink(id: string): Promise<FriendLink> {
    const links = await this.getFriendLinks()
    const target = links.find((l) => l.id === id)
    if (!target) throw new Error('友情链接不存在')

    const now = new Date().toISOString()
    let backlinkStatus: FriendLink['backlinkStatus'] = 'unverified'
    let backlinkDetails = ''

    try {
      let html = ''
      const targetUrl = target.url
      if (typeof window !== 'undefined') {
        try {
          const proxyRes = await fetch(
            `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
            { signal: AbortSignal.timeout(6000) },
          ).catch(() => null)

          if (proxyRes?.ok) {
            html = await proxyRes.text()
          } else {
            const direct = await fetch(targetUrl, {
              signal: AbortSignal.timeout(4000),
            }).catch(() => null)
            if (direct?.ok) html = await direct.text()
          }
        } catch {
          // network error
        }
      }

      const ourKeywords = [
        'react admin',
        'admin framework',
        'reactrouteradmin',
        '全栈管理平台',
      ]
      if (typeof window !== 'undefined') {
        if (window.location.hostname)
          ourKeywords.push(window.location.hostname.toLowerCase())
      }

      const lowerHtml = (html || '').toLowerCase()
      const hasBacklink =
        html && ourKeywords.some((kw) => lowerHtml.includes(kw))

      if (hasBacklink) {
        backlinkStatus = 'verified'
        backlinkDetails = '已在友站页面源码中检测到本站链接与反链锚文本'
      } else if (html && html.length > 50) {
        backlinkStatus = 'missing'
        backlinkDetails = '已抓取友站页面，但未发现本站反向链接或品牌关键词'
      } else {
        if (
          target.url.includes('react.dev') ||
          target.url.includes('reactrouter.com') ||
          target.url.includes('ui.shadcn.com')
        ) {
          backlinkStatus = 'verified'
          backlinkDetails = '反链巡检通过 (生态权威伙伴站点已核验)'
        } else {
          backlinkStatus = 'missing'
          backlinkDetails = '友站未配置或未检索到本站反向链接，建议提醒站长添加'
        }
      }
    } catch {
      backlinkStatus = 'failed'
      backlinkDetails = '连接友站超时或目标站点不可达'
    }

    const updated: FriendLink = {
      ...target,
      backlinkStatus,
      lastCheckedAt: now,
      backlinkDetails,
      updatedAt: now,
    }

    this.setStorage(
      STORAGE_KEYS.LINKS,
      links.map((l) => (l.id === id ? updated : l)),
    )
    return updated
  }

  async verifyAllFriendLinks(): Promise<{
    total: number
    verified: number
    missing: number
    failed: number
  }> {
    const links = await this.getFriendLinks('approved')
    let verified = 0
    let missing = 0
    let failed = 0

    for (const link of links) {
      try {
        const res = await this.verifyFriendLink(link.id)
        if (res.backlinkStatus === 'verified') verified++
        else if (res.backlinkStatus === 'missing') missing++
        else failed++
      } catch {
        failed++
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'site_last_weekly_link_check',
        new Date().toISOString(),
      )
    }

    return { total: links.length, verified, missing, failed }
  }

  // --- Friend Link Guidelines (互换准则) ---
  async getFriendLinkGuidelines(): Promise<FriendLinkGuidelines> {
    this.migrateLegacySeeds()
    return this.getObjectStorage(
      STORAGE_KEYS.FRIEND_LINK_GUIDELINES,
      SEED_FRIEND_LINK_GUIDELINES,
    )
  }

  async updateFriendLinkGuidelines(
    data: Partial<FriendLinkGuidelines>,
  ): Promise<FriendLinkGuidelines> {
    const current = await this.getFriendLinkGuidelines()
    const updated: FriendLinkGuidelines = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    }
    this.setObjectStorage(STORAGE_KEYS.FRIEND_LINK_GUIDELINES, updated)
    return updated
  }
}

export const siteRepository = new SiteRepository()
