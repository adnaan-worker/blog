import pageLoadingGif from '@/assets/images/page-loading.gif';

// 页面加载组件
const PageLoading = () => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'column',
      height: '100vh',
    }}
  >
    <img
      src={pageLoadingGif}
      alt="加载中..."
      style={{
        width: '200px',
        objectFit: 'contain',
        borderRadius: '10px',
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
        marginBottom: '20px',
      }}
    />
    <p
      style={{
        color: 'var(--text-secondary)',
        fontSize: '0.9rem',
      }}
    >
      加载中...
    </p>
  </div>
);
export default PageLoading;
