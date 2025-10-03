/**
 * 噪点背景生成工具
 * 基于Canvas API创建噪点纹理图像，并转换为数据URL
 */

/**
 * 创建彩色噪点背景图像并返回data URL
 * @param accentColor - 用于调整噪点颜色的主题色（十六进制）
 * @returns 生成的噪点背景图像的data URL
 */
export const createNoiseBackground = (accentColor: string = '#5183f5'): string => {
  try {
    // 创建离屏canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      console.error('无法创建Canvas上下文');
      return 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")';
    }

    // 设置画布尺寸
    canvas.width = 300;
    canvas.height = 300;

    // 解析主题色
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);

    console.log('噪点生成使用颜色:', { accentColor, r, g, b });

    // 填充白色背景
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 创建彩色噪点
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 定义噪点颜色列表 - 包含主题色和一些固定颜色
    const colors = [
      // 主题色系列
      [r, g, b],
      [r * 0.8, g * 0.8, b * 0.8],

      // 青色系
      [0, 180, 200],
      [0, 210, 230],

      // 桃红色系
      [255, 50, 150],
      [255, 80, 180],

      // 绿色系
      [20, 180, 120],
      [60, 210, 150],
    ];

    // 生成随机噪点
    for (let i = 0; i < data.length; i += 4) {
      // 只有约5%的像素会有噪点
      if (Math.random() > 0.95) {
        // 随机选择一种颜色
        const colorIndex = Math.floor(Math.random() * colors.length);
        const [pr, pg, pb] = colors[colorIndex];

        // 应用颜色
        data[i] = pr;
        data[i + 1] = pg;
        data[i + 2] = pb;
        data[i + 3] = 255; // 完全不透明
      } else {
        // 其余像素保持白色背景
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    }

    // 将处理后的图像数据放回画布
    ctx.putImageData(imageData, 0, 0);

    // 返回data URL
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    return `url("${dataUrl}")`;
  } catch (error) {
    console.error('生成噪点背景失败:', error);
    return 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")';
  }
};
