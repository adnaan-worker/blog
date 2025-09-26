import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { FiSearch, FiPackage, FiCode, FiBook, FiGrid, FiList, FiRefreshCw, FiDownload } from 'react-icons/fi';
import { Button, Input, Badge, Alert, Toast, Tooltip, Tabs, Pagination, InfiniteScroll } from '@/components/ui';
import { ToastProvider } from '@/components/ui/toast';
import ToastListener from '@/components/ui/toast-listener';
import { toast } from '@/ui';
import CodePreview from '@/components/ui/docs/code-preview';
import PropsTable from '@/components/ui/docs/props-table';
import {
  getAllComponentDocs,
  groupComponentsByCategory,
  CATEGORIES,
  ComponentDoc,
  ComponentExample,
} from '@/utils/doc-generator';

// 样式组件
const Container = styled.div`
  min-height: 100vh;
  background: var(--bg-primary);
  padding: 2rem;

  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  padding: 2rem 0;
  border-bottom: 1px solid var(--border-color);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem;

  &::before {
    content: '🎨';
    margin-right: 0.5rem;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin: 0 0 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const ToolBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex: 1;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const ToolBarActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 768px) {
    justify-content: space-between;
    width: 100%;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  text-align: center;
  transition: transform 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--accent-color);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
`;

const CategoryNav = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
`;

const CategoryButton = styled.button<{ active?: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: ${({ active }) => (active ? 'var(--accent-color)' : 'var(--bg-primary)')};
  color: ${({ active }) => (active ? 'white' : 'var(--text-primary)')};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ active }) => (active ? 'var(--accent-color-hover)' : 'var(--bg-tertiary)')};
    border-color: var(--accent-color);
  }
`;

const ComponentSection = styled.section`
  margin-bottom: 3rem;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid var(--border-color);
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
`;

const SectionDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-secondary);
  margin: 0;
  flex: 1;
`;

const ComponentCard = styled.div`
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  margin-bottom: 2rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ComponentHeader = styled.div`
  padding: 1.5rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
`;

const ComponentTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '🧩';
    font-size: 1.1rem;
  }
`;

const ComponentDescription = styled.p`
  font-size: 0.95rem;
  color: var(--text-secondary);
  margin: 0 0 1rem;
  line-height: 1.5;
`;

const ImportCode = styled.code`
  background: var(--bg-tertiary);
  color: var(--accent-color);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.85rem;
  display: inline-block;
  border: 1px solid rgba(var(--accent-color-rgb), 0.2);
`;

const ComponentContent = styled.div`
  padding: 1.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--text-tertiary);

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .title {
    font-size: 1.2rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  .description {
    font-size: 0.9rem;
    max-width: 400px;
    margin: 0 auto;
    line-height: 1.5;
  }
`;

// 主组件
const UIDocsPage: React.FC = () => {
  const [allDocs] = useState(() => getAllComponentDocs());
  const [filteredDocs, setFilteredDocs] = useState(allDocs);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [infiniteScrollItems, setInfiniteScrollItems] = useState(15);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 加载更多项目
  const handleLoadMore = () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    console.log('加载更多');

    // 模拟加载延迟
    setTimeout(() => {
      setInfiniteScrollItems((prev) => prev + 10);
      setIsLoadingMore(false);
      toast.success('加载了10个新项目');
    }, 1000);
  };

  // 防抖搜索
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      let filtered = allDocs;

      // 按分类过滤
      if (selectedCategory !== 'all') {
        filtered = filtered.filter((doc) => doc.category === selectedCategory);
      }

      // 按搜索关键词过滤
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (doc) => doc.name.toLowerCase().includes(query) || doc.description?.toLowerCase().includes(query),
        );
      }

      setFilteredDocs(filtered);
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [allDocs, selectedCategory, searchQuery]);

  // 渲染组件示例
  const renderComponentExamples = (examples: ComponentExample[], componentName: string) => {
    if (!examples || examples.length === 0) {
      return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)' }}>暂无示例代码</div>;
    }

    return examples.map((example, index) => (
      <CodePreview
        key={index}
        title={example.title}
        description={example.description}
        code={example.code}
        preview={renderExamplePreview(example, componentName)}
        layout="horizontal"
      />
    ));
  };

  // 渲染示例预览（这里需要根据实际组件动态渲染）
  const renderExamplePreview = (example: ComponentExample, componentName: string) => {
    try {
      switch (componentName) {
        case 'Button':
          return (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button variant="primary">主要按钮</Button>
              <Button variant="secondary">次要按钮</Button>
              <Button variant="outline">轮廓按钮</Button>
              <Button variant="ghost">幽灵按钮</Button>
              <Button variant="danger">危险操作</Button>
              <Button isLoading>加载中</Button>
              <Button disabled>禁用状态</Button>
            </div>
          );
        case 'Input':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px' }}>
              <Input placeholder="请输入内容" />
              <form onSubmit={(e) => e.preventDefault()}>
                <Input type="password" placeholder="请输入密码" autoComplete="new-password" />
              </form>
              <Input placeholder="错误状态" errorMessage="输入格式不正确" isInvalid={true} />
              <Input placeholder="禁用状态" disabled />
              <Input label="用户名" placeholder="请输入用户名" helperText="用户名长度为3-20个字符" />
            </div>
          );
        case 'Badge':
          return (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Button>消息</Button>
                <Badge count={5} style={{ position: 'absolute', top: '-8px', right: '-8px' }} />
              </div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Button>通知</Button>
                <Badge count={100} overflowCount={99} style={{ position: 'absolute', top: '-8px', right: '-8px' }} />
              </div>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Button>待处理</Button>
                <Badge dot style={{ position: 'absolute', top: '-4px', right: '-4px' }} />
              </div>
            </div>
          );
        case 'Toast':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  函数调用方式
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      toast.success('操作成功！');
                    }}
                  >
                    成功消息
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      toast.info('这是一条提示信息');
                    }}
                  >
                    信息消息
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      toast.warning('请注意检查输入内容');
                    }}
                  >
                    警告消息
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      toast.error('操作失败，请重试');
                    }}
                  >
                    错误消息
                  </Button>
                </div>
              </div>
              <div>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>自定义配置</h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.success('保存成功', '成功', 5000);
                    }}
                  >
                    带标题 (5秒)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      toast.error('网络错误', '错误', 0);
                    }}
                  >
                    不自动消失
                  </Button>
                </div>
              </div>
            </div>
          );
        case 'Alert':
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>组件方式</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Alert type="success" title="成功" message="恭喜你，操作成功完成！" closable />
                  <Alert type="info" title="提示" message="这是一条信息提示" />
                  <Alert type="warning" title="警告" message="请注意检查相关设置" />
                  <Alert type="error" title="错误" message="操作失败，请联系管理员" />
                </div>
              </div>
              <div>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  函数调用方式
                </h4>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      import('@/ui/alert').then(({ default: alert }) => {
                        alert.success('操作成功！', '成功');
                      });
                    }}
                  >
                    成功提示
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      import('@/ui/alert').then(({ default: alert }) => {
                        alert.info('这是一条信息', '提示');
                      });
                    }}
                  >
                    信息提示
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      import('@/ui/alert').then(({ default: alert }) => {
                        alert.warning('请注意！', '警告');
                      });
                    }}
                  >
                    警告提示
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      import('@/ui/alert').then(({ default: alert }) => {
                        alert.error('操作失败！', '错误');
                      });
                    }}
                  >
                    错误提示
                  </Button>
                </div>
              </div>
            </div>
          );
        case 'Tooltip':
          return (
            <div style={{ display: 'flex', gap: '1rem', padding: '2rem' }}>
              <Tooltip content="这是一个提示信息">
                <Button>悬停查看提示</Button>
              </Tooltip>
              <Tooltip content="删除操作不可恢复" placement="top">
                <Button variant="danger">删除</Button>
              </Tooltip>
              <Tooltip content="左侧提示" placement="left">
                <Button variant="secondary">左侧</Button>
              </Tooltip>
              <Tooltip content="右侧提示" placement="right">
                <Button variant="secondary">右侧</Button>
              </Tooltip>
            </div>
          );
        case 'Tabs':
          return (
            <div style={{ width: '100%' }}>
              <Tabs
                items={[
                  {
                    key: '1',
                    label: '基础信息',
                    content: (
                      <div style={{ padding: '1rem' }}>
                        <h4>用户基础信息</h4>
                        <p>这里显示用户的基础信息内容...</p>
                      </div>
                    ),
                  },
                  {
                    key: '2',
                    label: '账户设置',
                    content: (
                      <div style={{ padding: '1rem' }}>
                        <h4>账户设置</h4>
                        <p>这里显示账户设置相关内容...</p>
                      </div>
                    ),
                  },
                  {
                    key: '3',
                    label: '安全中心',
                    content: (
                      <div style={{ padding: '1rem' }}>
                        <h4>安全中心</h4>
                        <p>这里显示安全设置相关内容...</p>
                      </div>
                    ),
                  },
                ]}
                defaultActiveKey="1"
              />
            </div>
          );
        case 'Modal':
          return (
            <div style={{ display: 'flex', gap: '1rem', padding: '1rem', flexWrap: 'wrap' }}>
              <Button
                onClick={() => {
                  // 函数调用方式演示
                  import('@/ui/modal').then(({ default: modal }) => {
                    modal.show(<p>这是通过函数调用的模态框内容</p>, { title: '提示' });
                  });
                }}
              >
                函数调用模态框
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  import('@/ui/modal').then(({ default: modal }) => {
                    modal.info(<p>这是信息模态框</p>, '信息');
                  });
                }}
              >
                信息模态框
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  import('@/ui/modal').then(({ default: modal }) => {
                    modal
                      .confirm({
                        title: '确认删除',
                        message: '确定要删除这个项目吗？',
                        confirmText: '删除',
                        cancelText: '取消',
                        confirmVariant: 'danger',
                      })
                      .then((result) => {
                        console.log('确认结果:', result);
                      });
                  });
                }}
              >
                确认对话框
              </Button>
            </div>
          );
        case 'Confirm':
          return (
            <div style={{ display: 'flex', gap: '1rem', padding: '1rem', flexWrap: 'wrap' }}>
              <Button
                onClick={() => {
                  import('@/ui/confirm').then(({ confirm }) => {
                    confirm({
                      title: '确认操作',
                      message: '确定要执行此操作吗？',
                    }).then((result) => {
                      toast.success(result ? '用户确认了' : '用户取消了');
                    });
                  });
                }}
              >
                基础确认
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  import('@/ui/confirm').then(({ confirm }) => {
                    confirm({
                      title: '删除确认',
                      message: '删除后无法恢复，确定要删除吗？',
                      confirmText: '删除',
                      cancelText: '取消',
                      confirmVariant: 'danger',
                    }).then((result) => {
                      toast.success(result ? '执行删除操作' : '取消删除');
                    });
                  });
                }}
              >
                删除确认
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  import('@/ui/confirm').then(({ confirm }) => {
                    confirm({
                      title: '重要提醒',
                      message: '此操作将影响所有用户，请谨慎操作',
                      confirmText: '继续',
                      cancelText: '取消',
                      confirmVariant: 'primary',
                    }).then((result) => {
                      toast.success(result ? '继续操作' : '取消操作');
                    });
                  });
                }}
              >
                警告确认
              </Button>
            </div>
          );
        case 'InfiniteScroll':
          return (
            <div
              style={{
                height: '400px',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
                overflow: 'hidden',
              }}
            >
              <InfiniteScroll
                loading={isLoadingMore}
                hasMore={infiniteScrollItems < 50}
                onLoadMore={handleLoadMore}
                threshold={50}
                maxHeight="400px"
                itemCount={infiniteScrollItems}
              >
                <div>
                  {Array.from({ length: infiniteScrollItems }, (_, i) => (
                    <div
                      key={i}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid var(--border-color)',
                        background: i % 2 === 0 ? 'var(--bg-secondary)' : 'transparent',
                        minHeight: '60px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>列表项 {i + 1}</div>
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                          这是列表项的描述内容，用于演示无限滚动功能
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </InfiniteScroll>
            </div>
          );
        case 'Pagination':
          return (
            <div style={{ padding: '1rem' }}>
              <Pagination
                currentPage={1}
                totalPages={10}
                pageSize={20}
                totalItems={200}
                onPageChange={(page) => console.log('切换到页面:', page)}
                onPageSizeChange={(size) => console.log('每页显示:', size)}
                showQuickJumper={true}
                showSizeChanger={true}
                showTotal={true}
                showInfo={true}
              />
            </div>
          );
        default:
          return (
            <div
              style={{
                padding: '2rem',
                background: 'var(--bg-secondary)',
                borderRadius: '6px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              预览功能开发中...
            </div>
          );
      }
    } catch (error) {
      console.error('渲染预览失败:', error);
      return (
        <div
          style={{
            padding: '1rem',
            background: 'var(--error-color-alpha)',
            color: 'var(--error-color)',
            borderRadius: '6px',
            fontSize: '0.9rem',
          }}
        >
          预览渲染失败
        </div>
      );
    }
  };

  // 计算统计信息
  const categoryGroups = groupComponentsByCategory(allDocs);
  const totalComponents = allDocs.length;
  const totalCategories = Object.keys(CATEGORIES).length;
  const totalExamples = allDocs.reduce((sum, doc) => sum + doc.examples.length, 0);

  return (
    <ToastProvider>
      <ToastListener />
      <Container>
        <Header>
          <Title>UI 组件库文档</Title>
          <Subtitle>
            现代化的React组件库，提供丰富的UI组件和完整的设计系统。
            所有组件都经过精心设计，支持TypeScript，具有良好的可访问性和主题定制能力。
          </Subtitle>

          {/* 统计信息 */}
          <StatsGrid>
            <StatCard>
              <StatNumber>{totalComponents}</StatNumber>
              <StatLabel>组件总数</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{totalCategories}</StatNumber>
              <StatLabel>分类数量</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>{totalExamples}</StatNumber>
              <StatLabel>示例代码</StatLabel>
            </StatCard>
            <StatCard>
              <StatNumber>100%</StatNumber>
              <StatLabel>TypeScript</StatLabel>
            </StatCard>
          </StatsGrid>
        </Header>

        {/* 工具栏 */}
        <ToolBar>
          <SearchSection>
            <Input
              placeholder="搜索组件..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ minWidth: '300px' }}
            />
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                toast.success('已重置筛选条件');
              }}
            >
              <FiRefreshCw size={16} />
              重置
            </Button>
          </SearchSection>

          <ToolBarActions>
            <Tooltip content="切换视图模式">
              <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? <FiList size={16} /> : <FiGrid size={16} />}
              </Button>
            </Tooltip>
            <Tooltip content="下载组件源码">
              <Button variant="primary">
                <FiDownload size={16} />
                下载
              </Button>
            </Tooltip>
          </ToolBarActions>
        </ToolBar>

        {/* 分类导航 */}
        <CategoryNav>
          <CategoryButton active={selectedCategory === 'all'} onClick={() => setSelectedCategory('all')}>
            全部组件 ({totalComponents})
          </CategoryButton>
          {Object.entries(CATEGORIES).map(([key, category]) => {
            const count = categoryGroups[key]?.length || 0;
            return (
              <CategoryButton key={key} active={selectedCategory === key} onClick={() => setSelectedCategory(key)}>
                {category.title} ({count})
              </CategoryButton>
            );
          })}
        </CategoryNav>

        {/* 组件文档内容 */}
        {filteredDocs.length === 0 ? (
          <EmptyState>
            <div className="icon">🔍</div>
            <div className="title">没有找到匹配的组件</div>
            <div className="description">尝试调整搜索关键词或选择其他分类查看组件</div>
          </EmptyState>
        ) : (
          Object.entries(groupComponentsByCategory(filteredDocs)).map(([categoryKey, docs]) => (
            <ComponentSection key={categoryKey}>
              <SectionHeader>
                <SectionTitle>{CATEGORIES[categoryKey as keyof typeof CATEGORIES]?.title}</SectionTitle>
                <SectionDescription>
                  {CATEGORIES[categoryKey as keyof typeof CATEGORIES]?.description}
                </SectionDescription>
                <Badge count={docs.length} />
              </SectionHeader>

              {docs.map((doc) => (
                <ComponentCard key={doc.name}>
                  <ComponentHeader>
                    <ComponentTitle>{doc.name}</ComponentTitle>
                    <ComponentDescription>{doc.description}</ComponentDescription>
                    <ImportCode>
                      import {`{ ${doc.name} }`} from '{doc.importPath}';
                    </ImportCode>
                  </ComponentHeader>

                  <ComponentContent>
                    {/* 组件示例 */}
                    {renderComponentExamples(doc.examples, doc.name)}

                    {/* 属性表格 */}
                    <PropsTable props={doc.props} />
                  </ComponentContent>
                </ComponentCard>
              ))}
            </ComponentSection>
          ))
        )}
      </Container>
    </ToastProvider>
  );
};

export default UIDocsPage;
