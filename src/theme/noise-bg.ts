const hexToRbg = (hex: string) => {
  const r = Number.parseInt(hex.slice(1, 3), 16);
  const g = Number.parseInt(hex.slice(3, 5), 16);
  const b = Number.parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};
// 替换原有的createPngNoiseBackground函数
export const createCanvasNoiseBackground = (hex: string) => {
  return new Promise<string>((resolve) => {
    // 创建离屏Canvas
    const canvas = document.createElement('canvas');
    const width = 72;
    const height = 72;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve('');
      return;
    }

    // 解析颜色
    const { r, g, b } = hexToRbg(hex);

    // 创建ImageData并填充噪点
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      // 随机透明度（噪点效果）
      const alpha = Math.random() > 0.5 ? 255 : 0;
      data[i] = r; // R
      data[i + 1] = g; // G
      data[i + 2] = b; // B
      data[i + 3] = alpha; // A
    }

    ctx.putImageData(imageData, 0, 0);

    // 转换为base64
    const base64Url = canvas.toDataURL('image/png');
    resolve(`url('${base64Url}')`);
  });
};
