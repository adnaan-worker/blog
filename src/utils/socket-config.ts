// Socket.IO 配置检查工具
export const checkSocketConfig = () => {
  const config = {
    socketUrl: import.meta.env.VITE_SOCKET_URL,
    authKey: import.meta.env.VITE_SOCKET_IO_AUTH_KEY,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL,
  };

  console.group('🔍 Socket.IO 配置检查');
  console.log('Socket URL:', config.socketUrl || '❌ 未配置');
  console.log(
    'Auth Key:',
    config.authKey ? `✅ 已配置 (${config.authKey.substring(0, 8)}...)` : '❌ 未配置，使用默认值',
  );
  console.log('API Base URL:', config.apiBaseUrl || '❌ 未配置');

  // 检查配置完整性
  const missingConfigs = [];
  if (!config.socketUrl) missingConfigs.push('VITE_SOCKET_URL');
  if (!config.authKey) missingConfigs.push('VITE_SOCKET_IO_AUTH_KEY');

  if (missingConfigs.length > 0) {
    console.warn('⚠️ 缺少环境变量配置:', missingConfigs);
    console.warn('💡 请检查 .env 文件或环境变量设置');
  } else {
    console.log('✅ 配置检查通过');
  }

  console.groupEnd();

  return {
    ...config,
    isValid: missingConfigs.length === 0,
    missingConfigs,
  };
};

// 获取有效的鉴权令牌
export const getAuthToken = (): string => {
  const token = import.meta.env.VITE_SOCKET_IO_AUTH_KEY || 'default-socket-key-2024';

  if (token === 'default-socket-key-2024') {
    console.warn('⚠️ 正在使用默认的Socket.IO鉴权密钥，建议在生产环境中更改');
  }

  return token;
};
