# PDF 工具合集需求文档

## 项目概述
为现有 Next.js SaaS 应用添加一套完整的 PDF 工具集合，所有处理均在浏览器端完成，无需服务器参与。

## 功能需求

### 工具列表（10个）
1. **Merge PDF** - 合并多个 PDF 文件
2. **Split PDF** - 拆分 PDF（按页或自定义范围）
3. **Compress PDF** - 压缩 PDF 文件
4. **Rotate PDF** - 旋转 PDF 页面
5. **PDF to Images** - 将 PDF 转换为 JPG/PNG 图片
6. **Images to PDF** - 将图片转换为 PDF
7. **Watermark PDF** - 添加文字水印
8. **Page Numbers** - 添加页码
9. **Reorder Pages** - 重新排序页面
10. **Extract Pages** - 提取指定页面

### 页面需求
- **工具列表页** (`/tools`): 展示所有工具的卡片网格，按分类组织
- **工具详情页** (`/tools/[slug]`): 单个工具的操作界面，包含：
  - 文件上传区域（拖放支持）
  - 工具配置选项
  - 处理结果展示
  - 使用场景说明
  - FAQ 折叠面板
  - JSON-LD 结构化数据（SEO）

### 技术要求
- **处理引擎**: pdf-lib（PDF操作）+ pdfjs-dist（PDF渲染）
- **状态管理**: Zustand
- **UI组件**: Radix UI + TailwindCSS
- **拖拽排序**: 使用现有 @dnd-kit/sortable 组件
- **国际化**: next-intl（支持中英文）

### SEO 要求
- 每个工具页面有独立的 meta title/description
- 完整的 FAQ 结构化数据（JSON-LD）
- 使用案例展示
- 隐私说明（本地处理，不上传服务器）
- 站点地图包含所有工具页面

### 设计规范
- 卡片式布局（参考 iLovePDF 和 Product Hunt 风格）
- 无动画效果
- 响应式设计
- 工具图标使用 Lucide icons

## 实现记录

### 已完成内容

#### 依赖安装
- `pdf-lib` - PDF 操作库
- `pdfjs-dist` - PDF 渲染库

#### 配置文件
- `src/config/pdf-tools.ts` - 工具注册表和配置
- `src/routes.ts` - 添加 Tools 路由
- `src/app/sitemap.ts` - 添加工具页面站点地图
- `src/config/navbar-config.tsx` - 导航栏添加 Tools 链接
- `src/config/footer-config.tsx` - 页脚添加 PDF Tools 链接

#### PDF 处理库 (`src/lib/pdf/`)
- `worker-setup.ts` - PDF.js worker 初始化（使用本地 worker 文件）
- `preview.ts` - 缩略图生成
- `merge.ts` - PDF 合并
- `split.ts` - PDF 拆分
- `compress.ts` - PDF 压缩
- `rotate.ts` - PDF 旋转
- `to-images.ts` - PDF 转图片
- `from-images.ts` - 图片转 PDF（含 WebP 转 PNG）
- `watermark.ts` - 添加水印
- `page-numbers.ts` - 添加页码（支持数字、罗马数字、页码/总页数格式）
- `reorder.ts` - 重新排序页面
- `extract.ts` - 提取页面

#### 状态管理
- `src/stores/pdf-tool-store.ts` - Zustand store，管理文件列表、处理状态、结果
- `src/hooks/use-pdf-processor.ts` - 自定义 hook，封装文件加载和处理逻辑

#### UI 组件 (`src/components/pdf/`)
- `tool-card.tsx` - 工具卡片（服务器组件）
- `file-dropzone.tsx` - 文件拖放上传组件
- `pdf-preview.tsx` - PDF 预览组件（页面缩略图）
- `tool-layout.tsx` - 工具页面布局（含 SEO 结构化数据）
- `tool-component-loader.tsx` - 客户端动态组件加载器

#### 工具组件 (`src/components/pdf/tools/`)
- `merge-pdf.tsx` - 合并工具（支持文件排序）
- `split-pdf.tsx` - 拆分工具（支持单页拆分和范围拆分）
- `compress-pdf.tsx` - 压缩工具（显示压缩前后大小对比）
- `rotate-pdf.tsx` - 旋转工具（支持单页和全部旋转）
- `pdf-to-images.tsx` - PDF转图片（支持 JPG/PNG，可调节质量和缩放）
- `images-to-pdf.tsx` - 图片转PDF（支持拖拽排序，WebP自动转换）
- `watermark-pdf.tsx` - 水印工具（文字水印，可调节大小、透明度、位置）
- `page-numbers-pdf.tsx` - 页码工具（6个位置，3种格式）
- `reorder-pdf.tsx` - 重新排序工具（拖拽页面缩略图排序）
- `extract-pages-pdf.tsx` - 提取页面工具（选择特定页面提取）

#### 页面
- `src/app/[locale]/(marketing)/tools/page.tsx` - 工具列表落地页
- `src/app/[locale]/(marketing)/tools/[slug]/page.tsx` - 工具详情页

#### 国际化
- `messages/en.json` - 英文翻译（ToolsPage 命名空间）
- `messages/zh.json` - 中文翻译（ToolsPage 命名空间）

### 技术难点与解决方案

#### 1. PDF.js Worker 加载问题
**问题**: CDN 地址在某些网络环境下无法访问
**解决**: 使用本地 worker 文件路径 `new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url)`

#### 2. ArrayBuffer Detached 错误
**问题**: PDF.js worker 会转移（detached）传入的 ArrayBuffer
**解决**: 在传递给 PDF.js 前复制 buffer: `new Uint8Array(pdfBuffer)`

#### 3. React Hooks 顺序错误
**问题**: 在条件分支中调用 `usePdfProcessor()`
**解决**: 确保所有 hook 在组件顶部调用，解构出 error 后再使用

#### 4. SSR 与动态导入
**问题**: `dynamic()` with `ssr: false` 不能在 Server Component 中使用
**解决**: 创建客户端组件 `tool-component-loader.tsx` 封装动态导入

## 后续维护注意事项

1. **PDF.js 版本更新**: 更新 pdfjs-dist 时需检查 worker 路径是否变化
2. **新工具添加**: 遵循现有模式，在 `pdf-tools.ts` 注册，创建对应组件，添加翻译
3. **性能优化**: 大文件处理时可考虑添加 Web Worker 避免阻塞主线程
4. **错误处理**: 添加更详细的错误提示和用户引导

## 相关文件清单

### 核心配置
- `src/config/pdf-tools.ts`
- `src/routes.ts`
- `src/app/sitemap.ts`

### 处理库
- `src/lib/pdf/*.ts` (12个文件)

### 组件
- `src/components/pdf/*.tsx` (5个共享组件)
- `src/components/pdf/tools/*.tsx` (10个工具组件)

### 页面
- `src/app/[locale]/(marketing)/tools/page.tsx`
- `src/app/[locale]/(marketing)/tools/[slug]/page.tsx`

### 状态管理
- `src/stores/pdf-tool-store.ts`
- `src/hooks/use-pdf-processor.ts`

### 国际化
- `messages/en.json`
- `messages/zh.json`
