import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch } from '@/store';
import { setUser } from '@/store/modules/userSlice';
import { API } from '@/utils';
import type { OAuthProvider, OAuthStatus, OAuthBinding } from '@/types';

/**
 * OAuth 第三方登录 Hook
 */
export function useOAuth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [oauthStatus, setOauthStatus] = useState<OAuthStatus | null>(null);
  const [bindings, setBindings] = useState<OAuthBinding[]>([]);
  const [loading, setLoading] = useState(false);

  // 获取 OAuth 配置状态
  const fetchOAuthStatus = useCallback(async () => {
    try {
      const res = await API.user.oauth.getStatus();
      if (res.code === 200) {
        setOauthStatus(res.data);
      }
    } catch (error) {
      console.error('获取 OAuth 状态失败:', error);
    }
  }, []);

  // 获取用户绑定的第三方账号
  const fetchBindings = useCallback(async () => {
    try {
      const res = await API.user.oauth.getBindings();
      if (res.code === 200) {
        setBindings(res.data);
      }
    } catch (error) {
      console.error('获取绑定账号失败:', error);
    }
  }, []);

  // 第三方登录
  const loginWithOAuth = useCallback((provider: OAuthProvider) => {
    // 需要跳转到后端 API，使用完整路径
    const baseUrl = import.meta.env.VITE_PROXY_TARGET || '';
    const url = `${baseUrl}/api/auth/${provider}`;
    window.location.href = url;
  }, []);

  // 绑定第三方账号（已登录用户）
  const bindOAuth = useCallback((provider: OAuthProvider) => {
    const baseUrl = import.meta.env.VITE_PROXY_TARGET || '';
    const token = localStorage.getItem('token');
    const url = `${baseUrl}/api/auth/bind/${provider}?token=${token}`;
    window.location.href = url;
  }, []);

  // 解绑第三方账号
  const unbindOAuth = useCallback(async (provider: OAuthProvider) => {
    setLoading(true);
    try {
      const res = await API.user.oauth.unbind(provider);
      if (res.code === 200) {
        adnaan.toast.success('解绑成功');
        await fetchBindings();
        return true;
      } else {
        adnaan.toast.error(res.message || '解绑失败');
        return false;
      }
    } catch (error: any) {
      adnaan.toast.error(error?.message || '解绑失败');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchBindings]);

  // 检查是否已绑定某平台
  const isBound = useCallback((provider: OAuthProvider) => {
    return bindings.some(b => b.provider === provider);
  }, [bindings]);

  // 获取平台显示名称
  const getProviderName = useCallback((provider: OAuthProvider) => {
    const names: Record<OAuthProvider, string> = {
      github: 'GitHub',
      google: 'Google',
      gitee: 'Gitee',
    };
    return names[provider] || provider;
  }, []);

  // 获取平台图标
  const getProviderIcon = useCallback((provider: OAuthProvider) => {
    const icons: Record<OAuthProvider, string> = {
      github: 'ri-github-fill',
      google: 'ri-google-fill',
      gitee: 'ri-git-repository-fill',
    };
    return icons[provider] || 'ri-link';
  }, []);

  return {
    oauthStatus,
    bindings,
    loading,
    fetchOAuthStatus,
    fetchBindings,
    loginWithOAuth,
    bindOAuth,
    unbindOAuth,
    isBound,
    getProviderName,
    getProviderIcon,
  };
}

/**
 * OAuth 回调处理 Hook
 */
export function useOAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const provider = searchParams.get('provider');
    const action = searchParams.get('action');
    const success = searchParams.get('success');

    if (error) {
      setStatus('error');
      setMessage(decodeURIComponent(error));
      return;
    }

    if (action === 'bind') {
      // 绑定操作
      if (success === 'true') {
        setStatus('success');
        setMessage(`${provider} 账号绑定成功`);
        adnaan.toast.success(`${provider} 账号绑定成功`);
        // 延迟跳转到设置页
        setTimeout(() => {
          navigate('/profile?tab=settings', { replace: true });
        }, 1500);
      } else {
        setStatus('error');
        setMessage('绑定失败');
      }
      return;
    }

    if (token) {
      // 登录操作
      handleLoginCallback(token, provider || '');
    } else {
      setStatus('error');
      setMessage('登录失败：未获取到认证信息');
    }
  }, [searchParams]);

  const handleLoginCallback = async (token: string, provider: string) => {
    try {
      // 存储 token
      localStorage.setItem('token', token);

      // 获取用户信息
      const res = await API.user.getProfile();
      if (res.code === 200) {
        dispatch(setUser({ user: res.data as any, token }));
        setStatus('success');
        setMessage(`${provider} 登录成功`);
        adnaan.toast.success('登录成功', '欢迎回来');

        // 延迟跳转
        setTimeout(() => {
          navigate('/', { replace: true });
        }, 1000);
      } else {
        throw new Error(res.message || '获取用户信息失败');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error?.message || '登录失败');
      localStorage.removeItem('token');
    }
  };

  return { status, message };
}

export default useOAuth;
