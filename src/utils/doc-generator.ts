import fs from 'fs';
import path from 'path';

// 组件文档类型定义
export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface ComponentExample {
  title: string;
  description?: string;
  code: string;
  preview?: React.ReactNode;
}

export interface ComponentDoc {
  name: string;
  description?: string;
  props: ComponentProp[];
  examples: ComponentExample[];
  importPath: string;
  category: 'basic' | 'form' | 'feedback' | 'navigation' | 'layout' | 'data';
}

// 组件信息配置
export const COMPONENT_CONFIGS: Record<string, Partial<ComponentDoc>> = {
  Button: {
    description: '按钮组件，支持多种变体和状态',
    category: 'basic',
    examples: [
      {
        title: '基础用法',
        description: '基本的按钮样式',
        code: `<Button variant="primary">主要按钮</Button>
<Button variant="secondary">次要按钮</Button>
<Button variant="outline">轮廓按钮</Button>
<Button variant="ghost">幽灵按钮</Button>`,
      },
      {
        title: '按钮状态',
        description: '不同状态的按钮',
        code: `<Button isLoading>加载中</Button>
<Button disabled>禁用状态</Button>
<Button variant="danger">危险操作</Button>`,
      },
      {
        title: '带图标',
        description: '包含图标的按钮',
        code: `<Button variant="primary">
  <FiPlus size={16} />
  添加
</Button>
<Button variant="outline">
  <FiDownload size={16} />
  下载
</Button>`,
      },
    ],
  },
  Input: {
    description: '输入框组件，支持多种类型和验证',
    category: 'form',
    examples: [
      {
        title: '基础用法',
        code: `<Input placeholder="请输入内容" />
<Input type="password" placeholder="请输入密码" />
<Input type="email" placeholder="请输入邮箱" />`,
      },
      {
        title: '输入框状态',
        code: `<Input placeholder="正常状态" />
<Input placeholder="错误状态" errorMessage="输入格式不正确" isInvalid />
<Input placeholder="禁用状态" disabled />
<Input placeholder="只读状态" readOnly value="只读内容" />`,
      },
      {
        title: '带标签和描述',
        code: `<Input 
  label="用户名" 
  placeholder="请输入用户名"
  helperText="用户名长度为3-20个字符"
/>
<Input 
  label="邮箱" 
  type="email"
  placeholder="请输入邮箱"
  isRequired
/>`,
      },
    ],
  },
  Pagination: {
    description: '分页组件，支持页码跳转和页面大小选择',
    category: 'navigation',
    examples: [
      {
        title: '基础分页',
        code: `const [currentPage, setCurrentPage] = useState(1);
const totalPages = 10;
const pageSize = 20;
const totalItems = 200;

<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  pageSize={pageSize}
  totalItems={totalItems}
  onPageChange={setCurrentPage}
/>`,
      },
      {
        title: '完整功能',
        code: `<Pagination
  currentPage={1}
  totalPages={20}
  pageSize={10}
  totalItems={200}
  onPageChange={(page) => console.log(page)}
  onPageSizeChange={(size) => console.log(size)}
  showQuickJumper={true}
  showSizeChanger={true}
  showTotal={true}
  pageSizeOptions={[10, 20, 50, 100]}
/>`,
      },
    ],
  },
  InfiniteScroll: {
    description: '无限滚动组件，支持懒加载和骨架屏',
    category: 'data',
    examples: [
      {
        title: '基础用法',
        code: `const [items, setItems] = useState([]);
const [loading, setLoading] = useState(false);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  setLoading(true);
  // 模拟API调用
  const newItems = await fetchMoreItems();
  setItems(prev => [...prev, ...newItems]);
  setHasMore(newItems.length > 0);
  setLoading(false);
};

<InfiniteScroll
  hasMore={hasMore}
  loading={loading}
  onLoadMore={loadMore}
  itemCount={items.length}
>
  {items.map(item => (
    <div key={item.id}>{item.content}</div>
  ))}
</InfiniteScroll>`,
      },
      {
        title: '带错误处理',
        code: `<InfiniteScroll
  hasMore={hasMore}
  loading={loading}
  error={error}
  onLoadMore={loadMore}
  onRetry={retryLoad}
  itemCount={items.length}
  maxHeight="400px"
  showScrollToTop={true}
  enableSkeleton={true}
  skeletonCount={5}
>
  {/* 内容 */}
</InfiniteScroll>`,
      },
    ],
  },
  Toast: {
    description: '消息提示组件，用于显示操作反馈',
    category: 'feedback',
    examples: [
      {
        title: '基础用法',
        code: `import { toast } from '@/ui';

// 成功消息
toast.success('操作成功！');

// 错误消息
toast.error('操作失败，请重试');

// 警告消息
toast.warning('请注意检查输入内容');

// 信息消息
toast.info('这是一条提示信息');`,
      },
      {
        title: '自定义配置',
        code: `toast.success('保存成功', {
  duration: 5000,
  position: 'top-right'
});

toast.error('网络错误', {
  duration: 0, // 不自动消失
  action: {
    label: '重试',
    onClick: () => retry()
  }
});`,
      },
    ],
  },
  Modal: {
    description: '模态框组件，支持组件方式和函数调用方式',
    category: 'feedback',
    examples: [
      {
        title: '组件方式 - 基础用法',
        code: `const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="标题"
  size="medium"
>
  <p>这是模态框的内容</p>
</Modal>`,
      },
      {
        title: '组件方式 - 自定义底部',
        code: `<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="确认操作"
  footer={
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <Button variant="secondary" onClick={() => setIsOpen(false)}>
        取消
      </Button>
      <Button variant="primary" onClick={handleConfirm}>
        确认
      </Button>
    </div>
  }
>
  <p>确定要执行此操作吗？</p>
</Modal>`,
      },
      {
        title: '函数调用方式',
        code: `import { modal } from '@/ui';

// 基础模态框
modal.show(<p>这是内容</p>, { title: '提示' });

// 不同类型的模态框
modal.info(<p>信息内容</p>, '信息');
modal.success(<p>成功内容</p>, '成功');
modal.warning(<p>警告内容</p>, '警告');
modal.error(<p>错误内容</p>, '错误');

// 确认对话框
const result = await modal.confirm({
  title: '确认删除',
  message: '确定要删除这个项目吗？',
  confirmText: '删除',
  cancelText: '取消',
  confirmVariant: 'danger'
});

if (result) {
  console.log('用户确认删除');
}`,
      },
    ],
  },
  Confirm: {
    description: '确认对话框，用于重要操作的二次确认',
    category: 'feedback',
    examples: [
      {
        title: '基础用法',
        code: `import { confirm } from '@/ui';

// 简单确认
const result = await confirm({
  title: '确认操作',
  message: '确定要执行此操作吗？',
});

if (result) {
  console.log('用户确认了');
} else {
  console.log('用户取消了');
}`,
      },
      {
        title: '自定义按钮文本',
        code: `const result = await confirm({
  title: '删除确认',
  message: '删除后无法恢复，确定要删除吗？',
  confirmText: '删除',
  cancelText: '取消',
  confirmVariant: 'danger'
});`,
      },
      {
        title: '自定义图标和样式',
        code: `const result = await confirm({
  title: '重要提醒',
  message: '此操作将影响所有用户，请谨慎操作',
  icon: 'warning',
  confirmText: '继续',
  cancelText: '取消',
  confirmVariant: 'warning'
});`,
      },
    ],
  },
  Alert: {
    description: '警告提示组件，支持组件方式和函数调用方式',
    category: 'feedback',
    examples: [
      {
        title: '组件方式 - 不同类型',
        code: `<Alert type="success" title="成功" message="恭喜你，操作成功完成！" closable />
<Alert type="info" title="提示" message="这是一条信息提示" />
<Alert type="warning" title="警告" message="请注意检查相关设置" />
<Alert type="error" title="错误" message="操作失败，请联系管理员" />`,
      },
      {
        title: '函数调用方式',
        code: `import { alert } from '@/ui';

// 不同类型的提示
alert.success('操作成功！');
alert.error('操作失败！');
alert.warning('请注意！');
alert.info('提示信息');

// 带标题的提示
alert.success('操作成功！', '成功');

// 自定义持续时间（毫秒）
alert.info('3秒后自动关闭', '提示', 3000);`,
      },
    ],
  },
  Badge: {
    description: '徽章组件，用于显示数字或状态',
    category: 'basic',
    examples: [
      {
        title: '基础用法',
        code: `<Badge count={5}>
  <Button>消息</Button>
</Badge>

<Badge count={100} max={99}>
  <Button>通知</Button>
</Badge>

<Badge dot>
  <Button>待处理</Button>
</Badge>`,
      },
      {
        title: '不同状态',
        code: `<Badge status="success" text="成功" />
<Badge status="error" text="失败" />
<Badge status="warning" text="警告" />
<Badge status="processing" text="进行中" />`,
      },
    ],
  },
  Tabs: {
    description: '标签页组件，用于内容分组展示',
    category: 'navigation',
    examples: [
      {
        title: '基础用法',
        code: `const tabs = [
  { key: 'tab1', label: '标签一', content: '内容一' },
  { key: 'tab2', label: '标签二', content: '内容二' },
  { key: 'tab3', label: '标签三', content: '内容三' }
];

<Tabs 
  items={tabs}
  defaultActiveKey="tab1"
  onChange={(key) => console.log('切换到:', key)}
/>`,
      },
    ],
  },
  Tooltip: {
    description: '工具提示组件，用于显示补充信息',
    category: 'basic',
    examples: [
      {
        title: '基础用法',
        code: `<Tooltip content="这是一个提示信息">
  <Button>悬停查看提示</Button>
</Tooltip>

<Tooltip content="删除操作不可恢复" placement="top">
  <Button variant="danger">删除</Button>
</Tooltip>`,
      },
      {
        title: '不同位置',
        code: `<Tooltip content="顶部提示" placement="top">
  <Button>Top</Button>
</Tooltip>
<Tooltip content="右侧提示" placement="right">
  <Button>Right</Button>
</Tooltip>
<Tooltip content="底部提示" placement="bottom">
  <Button>Bottom</Button>
</Tooltip>
<Tooltip content="左侧提示" placement="left">
  <Button>Left</Button>
</Tooltip>`,
      },
    ],
  },
};

// 从TypeScript接口提取Props信息的模拟函数
// 在实际项目中，这需要使用TypeScript编译器API或AST解析
export function extractComponentProps(componentName: string): ComponentProp[] {
  const propMappings: Record<string, ComponentProp[]> = {
    Button: [
      {
        name: 'variant',
        type: '"primary" | "secondary" | "outline" | "ghost" | "danger"',
        required: false,
        defaultValue: '"primary"',
        description: '按钮变体',
      },
      {
        name: 'size',
        type: '"small" | "medium" | "large"',
        required: false,
        defaultValue: '"medium"',
        description: '按钮尺寸',
      },
      { name: 'isLoading', type: 'boolean', required: false, defaultValue: 'false', description: '加载状态' },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: '禁用状态' },
      { name: 'fullWidth', type: 'boolean', required: false, defaultValue: 'false', description: '全宽显示' },
      { name: 'onClick', type: '() => void', required: false, description: '点击事件处理函数' },
      { name: 'children', type: 'React.ReactNode', required: true, description: '按钮内容' },
    ],
    Input: [
      { name: 'type', type: 'string', required: false, defaultValue: '"text"', description: '输入框类型' },
      { name: 'placeholder', type: 'string', required: false, description: '占位符文本' },
      { name: 'value', type: 'string', required: false, description: '输入值' },
      { name: 'defaultValue', type: 'string', required: false, description: '默认值' },
      { name: 'disabled', type: 'boolean', required: false, defaultValue: 'false', description: '禁用状态' },
      { name: 'readOnly', type: 'boolean', required: false, defaultValue: 'false', description: '只读状态' },
      { name: 'isRequired', type: 'boolean', required: false, defaultValue: 'false', description: '必填标识' },
      { name: 'isInvalid', type: 'boolean', required: false, defaultValue: 'false', description: '错误状态' },
      { name: 'errorMessage', type: 'string', required: false, description: '错误信息' },
      { name: 'label', type: 'string', required: false, description: '标签文本' },
      { name: 'helperText', type: 'string', required: false, description: '帮助文本' },
      { name: 'leftIcon', type: 'React.ReactNode', required: false, description: '左侧图标' },
      { name: 'rightElement', type: 'React.ReactNode', required: false, description: '右侧元素' },
      {
        name: 'onChange',
        type: '(e: ChangeEvent<HTMLInputElement>) => void',
        required: false,
        description: '值变化回调',
      },
    ],
    Confirm: [
      { name: 'title', type: 'string', required: false, description: '确认框标题' },
      { name: 'message', type: 'React.ReactNode', required: true, description: '确认框内容' },
      { name: 'confirmText', type: 'string', required: false, defaultValue: '确认', description: '确认按钮文本' },
      { name: 'cancelText', type: 'string', required: false, defaultValue: '取消', description: '取消按钮文本' },
      {
        name: 'confirmVariant',
        type: 'primary | danger | warning',
        required: false,
        defaultValue: 'primary',
        description: '确认按钮样式',
      },
      { name: 'icon', type: 'string', required: false, description: '图标类型' },
    ],
    Pagination: [
      { name: 'currentPage', type: 'number', required: true, description: '当前页码' },
      { name: 'totalPages', type: 'number', required: true, description: '总页数' },
      { name: 'pageSize', type: 'number', required: true, description: '每页条数' },
      { name: 'totalItems', type: 'number', required: true, description: '总条数' },
      { name: 'onPageChange', type: '(page: number) => void', required: true, description: '页码变化回调' },
      {
        name: 'onPageSizeChange',
        type: '(pageSize: number) => void',
        required: false,
        description: '每页条数变化回调',
      },
      { name: 'showQuickJumper', type: 'boolean', required: false, defaultValue: 'false', description: '显示快速跳转' },
      {
        name: 'showSizeChanger',
        type: 'boolean',
        required: false,
        defaultValue: 'true',
        description: '显示页面大小选择器',
      },
      { name: 'showTotal', type: 'boolean', required: false, defaultValue: 'true', description: '显示总数信息' },
      {
        name: 'pageSizeOptions',
        type: 'number[]',
        required: false,
        defaultValue: '[10, 20, 50, 100]',
        description: '页面大小选项',
      },
    ],
    InfiniteScroll: [
      { name: 'hasMore', type: 'boolean', required: true, description: '是否还有更多数据' },
      { name: 'loading', type: 'boolean', required: true, description: '加载状态' },
      { name: 'error', type: 'Error | null', required: false, description: '错误信息' },
      { name: 'onLoadMore', type: '() => void', required: true, description: '加载更多回调' },
      { name: 'onRetry', type: '() => void', required: false, description: '重试回调' },
      { name: 'itemCount', type: 'number', required: false, defaultValue: '0', description: '当前项目数量' },
      { name: 'maxHeight', type: 'string', required: false, description: '最大高度' },
      {
        name: 'showScrollToTop',
        type: 'boolean',
        required: false,
        defaultValue: 'true',
        description: '显示回到顶部按钮',
      },
      { name: 'enableSkeleton', type: 'boolean', required: false, defaultValue: 'true', description: '启用骨架屏' },
      { name: 'skeletonCount', type: 'number', required: false, defaultValue: '3', description: '骨架屏数量' },
    ],
  };

  return propMappings[componentName] || [];
}

// 生成组件文档
export function generateComponentDoc(componentName: string): ComponentDoc {
  const config = COMPONENT_CONFIGS[componentName] || {};
  const props = extractComponentProps(componentName);

  return {
    name: componentName,
    description: config.description || `${componentName} 组件`,
    props,
    examples: config.examples || [],
    importPath: `@/components/ui`,
    category: config.category || 'basic',
  };
}

// 获取所有组件文档
export function getAllComponentDocs(): ComponentDoc[] {
  const componentNames = Object.keys(COMPONENT_CONFIGS);
  return componentNames.map(generateComponentDoc);
}

// 按分类分组组件
export function groupComponentsByCategory(docs: ComponentDoc[]): Record<string, ComponentDoc[]> {
  return docs.reduce((groups, doc) => {
    const category = doc.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(doc);
    return groups;
  }, {} as Record<string, ComponentDoc[]>);
}

// 分类信息
export const CATEGORIES = {
  basic: { title: '基础组件', description: '基本的UI元素' },
  form: { title: '表单组件', description: '用户输入和表单处理' },
  feedback: { title: '反馈组件', description: '用户操作反馈和提示' },
  navigation: { title: '导航组件', description: '页面导航和路由' },
  layout: { title: '布局组件', description: '页面布局和结构' },
  data: { title: '数据展示', description: '数据展示和处理' },
};
