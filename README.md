# 个人博客项目

一个现代化、响应式的个人博客网站，具有优雅的设计和流畅的用户体验。

## 感谢各位帮忙点点Star

![博客预览](![输入图片说明](![输入图片说明](public/image.png)))

## 项目特点

- 🎨 **美观的UI设计** - 精心设计的界面，提供舒适的视觉体验
- 🌓 **深色/浅色主题** - 支持自动和手动切换主题模式
- 📱 **全响应式布局** - 完美适配从手机到桌面的各种设备
- 🚀 **流畅的过渡动画** - 使用Framer Motion实现平滑的页面过渡和交互效果
- 📝 **丰富的内容展示** - 支持文章分类、笔记、时间线和思考等多种内容形式
- 🧑‍💻 **开发者友好** - 包含专门的代码展示页面和开发者字体配置

## 技术栈

- **前端框架**: React
- **路由**: React Router
- **样式**: Emotion (CSS-in-JS)
- **动画**: Framer Motion
- **图标**: React Icons

## 页面结构

- **首页** - 展示最新内容和博客概览
- **文章** - 按主题分类的文章集合
- **手记** - 简短的学习笔记和心得
- **关于** - 个人介绍和联系方式
- **项目** - 技术项目展示
- **开发者字体** - 专为开发者优化的代码字体展示

## 组件特色

### 导航系统

- 响应式导航栏，在移动设备上自动转换为抽屉菜单
- 基于当前路由的活跃状态视觉反馈
- 下拉菜单支持多级导航

### 主题系统

- 基于CSS变量的主题定制
- 支持浅色/深色模式切换
- 平滑的主题切换过渡效果

### 代码展示

- 支持语法高亮的代码块
- 复制代码功能
- 行号显示
- 使用专业开发者字体栈

## 安装与使用

1. 克隆仓库
```bash
git clone https://gitee.com/adnaan/blog.git
cd blog
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建生产版本
```bash
npm run build
```

## 项目结构

```
src                 
│
├─assets                  #静态资源文件
│  ├─images                   #图片
│  ├─font                     #字体
│  ├─icon                     #图标
│  ├─script                   #脚本
│  ├─model                    #模型
│  └─video                    #音频
│
├─components             #可复用组件
│  ├─BlogComponents.tsx       #文章列表及详情所需组件
│  ├─CodeBlock.tsx            #代码块组件
│  ├─FloatingToolbar.tsx      #音乐播放器及返回顶部工具栏组件
│  ├─Live2DModel.tsx          #live2D组件
│  ├─TextEditor.tsx           #富文本编辑器组件
│  └─UIComponents.tsx         #UI组件
│
├─layouts                #布局组件
│  ├─Header.tsx               #页面头部组件
│  ├─Footer.tsx               #页面底部组件
│  └─RootLayout.tsx           #页面主体结构
│
├─context                #React上下文
│  └─ThemeContext.tsx         #主题上下文配置
│
├─pages                  #页面模块

#注：当前目录结构会经过优化，优化后补齐全部
```

## 自定义配置

### 主题配置

主题颜色和其他视觉元素可以在全局CSS变量中配置。主要变量包括：

- `--bg-primary`: 主背景色
- `--text-primary`: 主文本颜色
- `--text-secondary`: 次要文本颜色
- `--accent-color`: 强调色
- `--border-color`: 边框颜色
- `--font-code`: 代码字体栈

### 开发者字体配置

代码字体优先级：
```
OperatorMonoSSmLig Nerd Font, Cascadia Code PL, FantasqueSansMono Nerd Font, 
operator mono, JetBrainsMono, Fira code Retina, Fira code, Consolas, Monaco, 
Hannotate SC, monospace, -apple-system
```

## 贡献

欢迎提交问题和拉取请求来改进这个项目。

## 许可

MPL
