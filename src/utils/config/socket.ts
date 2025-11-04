// Socket.IO 配置工具
export interface SocketConfig {
  url: string;
  wsUrl?: string;
  authKey: string;
}

// 扩展的Socket配置
export interface ExtendedSocketConfig extends SocketConfig {
  reconnectDelay: number;
  maxReconnectAttempts: number;
  timeout: number;
  transports: string[];
}

// 获取Socket配置
export const getSocketConfig = (): SocketConfig => {
  const config: SocketConfig = {
    url: import.meta.env.VITE_SOCKET_URL,
    wsUrl: import.meta.env.VITE_SOCKET_WS_URL,
    authKey: import.meta.env.VITE_SOCKET_IO_AUTH_KEY,
  };

  return config;
};

// 获取完整的Socket配置（包含默认值）
export const getFullSocketConfig = (): ExtendedSocketConfig => {
  const baseConfig = getSocketConfig();

  return {
    ...baseConfig,
    reconnectDelay: 2000,
    maxReconnectAttempts: 5,
    timeout: 15000,
    transports: ['websocket', 'polling'],
  };
};

// 验证配置是否完整
export const validateSocketConfig = (config: SocketConfig): boolean => {
  const errors: string[] = [];

  if (!config.url) {
    errors.push('URL不能为空');
  } else {
    try {
      new URL(config.url);
    } catch {
      errors.push('URL格式无效');
    }
  }

  if (!config.authKey) {
    errors.push('认证密钥不能为空');
  } else if (config.authKey.length < 8) {
    errors.push('认证密钥长度不能少于8位');
  }

  if (errors.length > 0) {
    console.error('❌ Socket配置验证失败:', errors);
    return false;
  }

  return true;
};

// 检查Socket连接性（可选的连通性测试）
export const testSocketConnectivity = async (url: string): Promise<boolean> => {
  try {
    // 简单的HTTP连通性测试
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url.replace(/\/socket\.io$/, '/api/system/health'), {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.warn('⚠️ Socket连通性测试失败:', error);
    return false;
  }
};
