/**
 * 字符串工具函数
 * 提供字符串处理、截断等功能
 */

/**
 * 截断文本，超出部分用省略号代替
 * @param text 要截断的文本
 * @param maxLength 最大长度
 * @returns 截断后的文本
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength).trim() + '...';
};
