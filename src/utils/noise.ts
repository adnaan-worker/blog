/**
 * 噪点背景生成工具
 * 基于Canvas API创建噪点纹理图像，并转换为数据URL
 */

/**
 * 将十六进制颜色转换为RGB对象
 */
const hexToRgb = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
};

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
      [60, 210, 150]
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

/**
 * 创建SVG彩色噪点背景
 * @param opacity - 噪点的不透明度
 * @param accentColor - 用于调整噪点颜色的主题色（十六进制）
 * @returns SVG噪点图案的URL编码，已包装在url()中
 */
export const createSvgNoiseBackground = (opacity: number = 0.1, accentColor: string = '#5183f5'): string => {
  try {
    // 解析颜色
    const r = parseInt(accentColor.slice(1, 3), 16);
    const g = parseInt(accentColor.slice(3, 5), 16);
    const b = parseInt(accentColor.slice(5, 7), 16);
    
    // 创建四个不同的随机彩色噪点
    const colors = [
      { r: 0, g: 180, b: 200 },   // 青色
      { r: 255, g: 50, b: 150 },  // 桃红色
      { r, g, b },                // 主题色
      { r: 20, g: 180, b: 120 }   // 绿色
    ];
    
    // 创建彩色噪点SVG
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <defs>
        ${colors.map((color, index) => `
          <filter id="noise${index}">
            <feTurbulence type="fractalNoise" baseFrequency="0.03" seed="${Math.random() * 100}" numOctaves="1" />
            <feColorMatrix type="matrix" values="
              0 0 0 0 ${color.r/255}
              0 0 0 0 ${color.g/255}
              0 0 0 0 ${color.b/255}
              0 0 0 1 0
            "/>
          </filter>
        `).join('')}
      </defs>
      <rect width="100%" height="100%" fill="white" />
      ${colors.map((_, index) => `
        <rect width="100%" height="100%" filter="url(#noise${index})" opacity="${opacity * 1.5}" />
      `).join('')}
    </svg>`;
    
    // 将SVG编码为URL
    const encodedSvg = encodeURIComponent(svg);
    return `url("data:image/svg+xml,${encodedSvg}")`;
  } catch (error) {
    console.error('生成SVG噪点背景失败:', error);
    return 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")';
  }
};

/**
 * 服务端兼容版本的彩色噪点背景生成器
 * @param accentColor - 主题色
 * @returns 预生成的SVG噪点背景，已包装在url()中
 */
export const createServerCompatibleNoise = (accentColor: string = '#5183f5'): string => {
  try {
    // 固定的彩色噪点SVG，适用于服务端渲染
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <defs>
        <filter id="cyan-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" seed="10" numOctaves="1" />
          <feColorMatrix type="matrix" values="
            0 0 0 0 0
            0 0 0 0 0.75
            0 0 0 0 0.85
            0 0 0 0.15 0
          "/>
        </filter>
        <filter id="pink-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" seed="20" numOctaves="1" />
          <feColorMatrix type="matrix" values="
            0 0 0 0 1
            0 0 0 0 0.2
            0 0 0 0 0.6
            0 0 0 0.15 0
          "/>
        </filter>
        <filter id="theme-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" seed="30" numOctaves="1" />
          <feColorMatrix type="matrix" values="
            0 0 0 0 0.2
            0 0 0 0 0.7
            0 0 0 0 0.5
            0 0 0 0.15 0
          "/>
        </filter>
      </defs>
      <rect width="100%" height="100%" fill="white" />
      <rect width="100%" height="100%" filter="url(#cyan-noise)" />
      <rect width="100%" height="100%" filter="url(#pink-noise)" />
      <rect width="100%" height="100%" filter="url(#theme-noise)" />
    </svg>`;
    
    // 将SVG编码为URL
    const encodedSvg = encodeURIComponent(svg);
    return `url("data:image/svg+xml,${encodedSvg}")`;
  } catch (error) {
    console.error('生成服务端兼容噪点背景失败:', error);
    return 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=")';
  }
};

/**
 * 创建PNG样式的噪点背景（浏览器兼容版本）
 * @param hex - 用于噪点颜色的十六进制颜色
 * @returns 生成的噪点背景图像的data URL
 */
export const createPngNoiseBackground = (hex: string): string => {
  try {
    const { r, g, b } = hexToRgb(hex);
    const width = 72;
    const height = 72;
    
    // 创建离屏canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      console.error('无法创建Canvas上下文');
      return `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')`;
    }
    
    // 设置画布尺寸
    canvas.width = width;
    canvas.height = height;
    
    // 创建ImageData对象
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    // 生成随机噪点
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (width * y + x) << 2;
        const rand = Math.random();
        const color = rand > 0.5 ? 255 : 0;
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
        data[idx + 3] = color;
      }
    }
    
    // 将处理后的图像数据放回画布
    ctx.putImageData(imageData, 0, 0);
    
    // 返回data URL
    return `url('${canvas.toDataURL('image/png')}')`;
  } catch (error) {
    console.error('生成PNG噪点背景失败:', error);
    return `url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')`;
  }
};