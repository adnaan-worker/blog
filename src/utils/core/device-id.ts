import { storage } from './index';

/**
 * 生成设备唯一标识
 * 用于准确统计在线人数（同一设备多个标签页只计为1人）
 */
export const getDeviceId = (): string => {
  const STORAGE_KEY = 'device_id';

  // 尝试从localStorage获取
  let deviceId = storage.local.get<string>(STORAGE_KEY);

  if (!deviceId) {
    // 生成新的设备ID
    deviceId = generateUUID();
    storage.local.set(STORAGE_KEY, deviceId);
  }

  return deviceId;
};

/**
 * 生成UUID
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
