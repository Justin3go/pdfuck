# PDF 工具合集需求文档

## 项目概述
为现有 Next.js SaaS 应用添加一套完整的 PDF 工具集合，所有处理均在浏览器端完成，无需服务器参与。

## 功能需求

### 工具列表（38个）

#### 整理 (Organize)
1. **Merge PDF** - 合并多个 PDF 文件
2. **Split PDF** - 拆分 PDF（按页或自定义范围）
3. **Rotate PDF** - 旋转 PDF 页面
4. **Reorder Pages** - 重新排序页面
5. **Extract Pages** - 提取指定页面
6. **Delete Pages** - 删除指定页面
7. **Reverse PDF** - 反转页面顺序
8. **Duplicate Pages** - 复制页面

#### 转换 (Convert)
9. **PDF to PNG** - 将 PDF 转换为无损 PNG 图片
10. **PDF to JPG** - 将 PDF 转换为可调质量的 JPG 图片
11. **PDF to WebP** - 将 PDF 转换为现代 WebP 图片
12. **PNG to PDF** - 将 PNG 图片转换为 PDF
13. **JPG to PDF** - 将 JPG 图片转换为 PDF
14. **WebP to PDF** - 将 WebP 图片转换为 PDF
15. **BMP to PDF** - 将 BMP 图片转换为 PDF
16. **GIF to PDF** - 将 GIF 图片转换为 PDF
17. **SVG to PDF** - 将 SVG 图片转换为 PDF
18. **PDF to Text** - 将 PDF 转换为纯文本
19. **PDF to Word** - 将 PDF 转换为 Word 文档
20. **PDF to Excel** - 将 PDF 转换为 Excel 表格
21. **PDF to PowerPoint** - 将 PDF 转换为 PPT 演示文稿
22. **Word to PDF** - 将 Word 文档转换为 PDF
23. **Excel to PDF** - 将 Excel 表格转换为 PDF
24. **PowerPoint to PDF** - 将 PPT 演示文稿转换为 PDF

#### 编辑 (Edit)
25. **Compress PDF** - 压缩 PDF 文件
26. **Watermark PDF** - 添加文字水印
27. **Page Numbers** - 添加页码
28. **Edit Metadata** - 编辑 PDF 元数据
29. **Crop PDF** - 裁剪 PDF 页面
30. **Flatten PDF** - 展平 PDF 表单
31. **Header & Footer** - 添加页眉页脚
32. **Resize PDF** - 调整页面大小

#### 安全 (Security)
33. **Sign PDF** - 添加数字签名
34. **Unlock PDF** - 移除 PDF 密码保护
35. **Protect PDF** - 添加 PDF 密码保护
36. **Compare PDF** - 比较两个 PDF 文档
37. **Redact PDF** - 永久编校敏感信息
38. **OCR PDF** - 识别扫描版 PDF 文字

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
- `src/config/pdf-tools.ts` - 工具注册表和配置（按类别组织）
- `src/routes.ts` - 添加 Tools 路由
- `src/app/sitemap.ts` - 添加工具页面站点地图
- `src/config/navbar-config.tsx` - 导航栏按类别展示工具（支持下拉展开）
- `src/config/footer-config.tsx` - 页脚按类别分组展示工具链接

#### PDF 处理库 (`src/lib/pdf/`)
- `worker-setup.ts` - PDF.js worker 初始化（使用本地 worker 文件）
- `preview.ts` - 缩略图生成
- `merge.ts` - PDF 合并
- `split.ts` - PDF 拆分
- `compress.ts` - PDF 压缩
- `rotate.ts` - PDF 旋转
- `to-images.ts` - PDF 转图片（支持 PNG/JPG/WebP 三种格式）
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
- `pdf-to-format-tool.tsx` - PDF转图片共享组件（接受 format/fileExtension/i18nKey props）
- `pdf-to-png.tsx` - PDF转PNG（薄包装，使用 pdf-to-format-tool）
- `pdf-to-jpg.tsx` - PDF转JPG（薄包装，使用 pdf-to-format-tool）
- `pdf-to-webp.tsx` - PDF转WebP（薄包装，使用 pdf-to-format-tool）
- `format-to-pdf-tool.tsx` - 图片转PDF共享组件（接受 acceptedMimeType/i18nKey props）
- `png-to-pdf.tsx` - PNG转PDF（薄包装，使用 format-to-pdf-tool）
- `jpg-to-pdf.tsx` - JPG转PDF（薄包装，使用 format-to-pdf-tool）
- `webp-to-pdf.tsx` - WebP转PDF（薄包装，使用 format-to-pdf-tool）
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

## 2025-02-01 更新：Landing Page 重新设计

### 主要变更

#### 1. 导航栏简化
- **变更**: 删除所有导航链接
- **原因**: 一进入网站就是工具合集 landing page，无需额外导航
- **修改文件**: `src/config/navbar-config.tsx`
- **实现**: `useNavbarLinks()` 返回空数组

#### 2. Landing Page 重新设计
- **变更**: 将工具列表从 `/tools` 页面整合到首页
- **新结构**:
  - Hero 区域：主标题 + 副标题 + 隐私说明
  - 特性栏：极速处理 / 100% 私密 / 完全免费
  - 工具网格：按分类展示所有 PDF 工具
  - 使用步骤：3步说明如何使用
  - FAQ 区域：常见问题解答
- **SEO 优化**:
  - 更新 Metadata 为 PDFuck 品牌
  - 添加适当的内容层次结构（h1/h2/h3）
  - 保持所有工具页面的独立 SEO
- **修改文件**:
  - `src/app/[locale]/(marketing)/(home)/page.tsx` - 新首页
  - `messages/en.json` / `messages/zh.json` - 添加 HomePage 翻译

#### 3. 页脚简化
- **变更**: 删除产品、资源、公司栏目，只保留法律链接
- **修改文件**: `src/config/footer-config.tsx`
- **新结构**: 仅保留隐私政策和服务条款

#### 4. 品牌统一
- **名称**: PDFuck
- **英文描述**: "Free Online PDF Tools - 100% private and secure"
- **中文描述**: "免费在线 PDF 工具 - 100% 隐私保护"
- **Metadata 更新**:
  - 标题: "PDFuck - Free Online PDF Tools"
  - 描述: "Free browser-based PDF tools. Merge, split, compress, rotate, convert PDFs. 100% privacy..."

### 保留的页面
- `/tools/[slug]` - 各工具的独立操作页面（用于 SEO 和直接访问）
- `/tools` - 工具列表页（保留，作为备用入口）

## 2025-02-01 更新：导航和页脚按类别组织

### 导航栏结构
- **主菜单**: "PDF Tools"（或本地化翻译）
- **下拉菜单**: 按类别组织
  - **整理 (Organize)**: 合并、拆分、旋转、重排、提取
  - **转换 (Convert)**: PDF转PNG、PDF转JPG、PDF转WebP、PNG转PDF、JPG转PDF、WebP转PDF
  - **编辑 (Edit)**: 压缩、水印、页码

### 页脚结构
- **整理**: 所有整理类工具链接
- **转换**: 所有转换类工具链接
- **编辑**: 所有编辑类工具链接
- **法律**: 隐私政策、服务条款

### 实现说明
- 使用 `PDF_TOOLS` 和 `PDF_TOOL_CATEGORIES` 配置自动生成导航和页脚
- 导航栏支持多级下拉（类别 → 具体工具）
- 页脚扁平化展示，每个类别为一个栏目
- 新增翻译键：
  - `Common.pdfTools` - 导航主菜单标题
  - `ToolsPage.common.legal` - 页脚法律栏目
  - `ToolsPage.common.privacyPolicy` - 隐私政策
  - `ToolsPage.common.termsOfService` - 服务条款

### 修改文件
- `src/config/navbar-config.tsx` - 按类别组织的导航菜单
- `src/config/footer-config.tsx` - 按类别组织的页脚链接
- `messages/en.json` / `messages/zh.json` - 添加新翻译键

## 后续维护注意事项

1. **PDF.js 版本更新**: 更新 pdfjs-dist 时需检查 worker 路径是否变化
2. **新工具添加**: 遵循现有模式，在 `pdf-tools.ts` 注册，创建对应组件，添加翻译
3. **性能优化**: 大文件处理时可考虑添加 Web Worker 避免阻塞主线程
4. **错误处理**: 添加更详细的错误提示和用户引导
5. **SEO 监控**: 定期检查搜索排名，优化关键词

## 2025-02-03 更新：PDF转图片增强功能

### 新增功能
1. **合并长图功能**
   - 将PDF的多页合并成一张长图
   - 页面垂直排列，宽度统一取最大宽度
   - 窄页自动居中显示
   - 支持PNG/JPG/WebP三种格式

2. **ZIP打包下载**
   - 多页PDF转换后可选ZIP打包下载
   - 避免浏览器多次弹窗确认
   - 适合页数较多的PDF文件

### 修改文件
- `src/lib/pdf/to-images.ts` - 添加合并长图功能
- `src/components/pdf/tools/pdf-to-format-tool.tsx` - 添加选项UI和ZIP下载逻辑
- `messages/zh.json` / `messages/en.json` - 添加新翻译键

### 新增依赖
- `@zip.js/zip.js` - ZIP文件创建库

### 新翻译键
- `ToolsPage.common.options` - 选项标题
- `ToolsPage.common.mergeLongImage` - 合并长图选项
- `ToolsPage.common.downloadAsZip` - ZIP下载选项
- `ToolsPage.common.downloadZip` - 下载ZIP按钮
- `ToolsPage.common.downloadMerged` - 下载长图按钮
- `ToolsPage.common.mergedImageDesc` - 合并完成描述

## 2025-02-04 更新：新增6个PDF工具

### 新增工具列表

#### 整理类别
1. **Duplicate Pages (复制页面)**
   - 复制PDF中的一个或多个页面到指定位置
   - 支持设置复制份数（1-10份）
   - 支持在文档开头或末尾插入副本

#### 编辑类别
2. **Header & Footer (页眉页脚)**
   - 为PDF添加自定义页眉和页脚文本
   - 支持自定义字体大小、对齐方式
   - 可选择应用于所有页面、奇数页或偶数页

3. **Resize PDF (调整页面大小)**
   - 修改PDF页面尺寸为A4、Letter、Legal等标准大小
   - 支持保持原始内容或缩放内容适应新尺寸
   - 保留原始文档的元数据

#### 安全类别
4. **OCR PDF (文字识别)**
   - 识别扫描版PDF中的文字
   - 使用 Tesseract.js 进行OCR识别
   - 添加可搜索的透明文字层，保留原始图片外观
   - 支持中文、英文双语识别

### 新增依赖
- `tesseract.js` - OCR文字识别库

### 新增文件

#### PDF处理库 (`src/lib/pdf/`)
- `duplicate-pages.ts` - 页面复制功能
- `header-footer.ts` - 页眉页脚添加
- `resize.ts` - 页面大小调整
- `ocr.ts` - OCR文字识别

#### 工具组件 (`src/components/pdf/tools/`)
- `duplicate-pages-pdf.tsx` - 复制页面工具组件
- `header-footer-pdf.tsx` - 页眉页脚工具组件
- `resize-pdf.tsx` - 调整大小工具组件
- `ocr-pdf.tsx` - OCR工具组件

#### 图标 (`src/components/icons/file-icons.tsx`)
- `DuplicateIcon` - 复制页面图标
- `HeaderFooterIcon` - 页眉页脚图标
- `ResizeIcon` - 调整大小图标
- `OcrIcon` - OCR识别图标

### 修改文件
- `src/config/pdf-tools.ts` - 注册新工具
- `src/components/pdf/tool-component-loader.tsx` - 添加动态导入
- `messages/zh.json` / `messages/en.json` - 添加翻译

---

## 相关文件清单

### 核心配置
- `src/config/pdf-tools.ts`
- `src/routes.ts`
- `src/app/sitemap.ts`

### 处理库
- `src/lib/pdf/*.ts` (30个文件)

### 组件
- `src/components/pdf/*.tsx` (5个共享组件)
- `src/components/pdf/tools/*.tsx` (20个工具组件)

### 页面
- `src/app/[locale]/(marketing)/tools/page.tsx`
- `src/app/[locale]/(marketing)/tools/[slug]/page.tsx`

### 状态管理
- `src/stores/pdf-tool-store.ts`
- `src/hooks/use-pdf-processor.ts`

### 国际化
- `messages/en.json`
- `messages/zh.json`
