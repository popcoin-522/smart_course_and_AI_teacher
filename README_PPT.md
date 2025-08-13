# PPT生成功能集成说明
README_PPT.md - PPT功能的详细使用说明
PROJECT_INTEGRATION.md - 项目集成总结文档
## 概述

本项目已成功集成 `create_PPT2` 功能，现在可以在智能课程平台中直接生成PPT文件。

## 功能特性

- 🎯 智能PPT生成：基于Markdown内容自动生成PPTX文件
- 📝 多种模板：支持讲座模板和简单模板
- 🔧 灵活配置：可自定义标题、作者、日期、章节内容
- 📥 一键下载：生成完成后可直接下载PPT文件
- 🌐 现代化UI：使用Ant Design组件，界面美观易用

## 项目结构

```
smart course and AI teacher/
├── src/
│   ├── components/
│   │   └── PPTGenerator.tsx    # PPT生成器React组件
│   └── App.tsx                 # 主应用（已集成PPT功能）
├── server/
│   ├── ppt_service.py          # Flask后端服务
│   ├── templates/              # PPT模板文件
│   │   ├── lecture.md.jinja    # 讲座模板
│   │   └── simple.md.jinja     # 简单模板
│   ├── requirements.txt        # Python依赖
│   └── start_ppt_service.py   # 服务启动脚本
└── README_PPT.md               # 本文档
```

## 快速开始

### 1. 启动后端服务

```bash
cd server
pip install -r requirements.txt
python start_ppt_service.py
```

服务将在 `http://localhost:5000` 启动。

### 2. 启动前端应用

```bash
npm install
npm run dev
```

### 3. 使用PPT生成器

1. 点击"打开调试面板"按钮
2. 切换到"PPT生成器"标签页
3. 填写PPT信息（标题、章节等）
4. 点击"生成PPT"按钮
5. 生成完成后点击"下载PPT"

## 技术架构

### 前端 (React + TypeScript)
- **PPTGenerator组件**：提供用户界面，处理表单提交
- **Ant Design**：UI组件库，提供美观的界面
- **TypeScript**：类型安全，更好的开发体验

### 后端 (Flask + Python)
- **Flask应用**：提供RESTful API接口
- **Jinja2模板引擎**：渲染Markdown模板
- **python-pptx**：生成完全可编辑的PPTX文件
- **CORS支持**：允许前端跨域访问

### 数据流
1. 用户在前端填写PPT信息
2. 前端发送POST请求到后端API
3. 后端使用Jinja2渲染Markdown模板
4. 使用python-pptx生成PPTX文件
5. 返回下载链接给前端
6. 用户点击下载完成PPT获取

## API接口

### 生成PPT
- **URL**: `POST /api/generate-ppt`
- **请求体**:
```json
{
  "title": "课程标题",
  "content": {
    "sections": [
      {
        "title": "章节标题",
        "description": "章节描述"
      }
    ]
  },
  "author": "作者姓名",
  "date": "2024-01-01",
  "template": "lecture.md.jinja"
}
```

### 下载PPT
- **URL**: `GET /download/<filename>`
- **响应**: PPTX文件下载

### 健康检查
- **URL**: `GET /api/health`
- **响应**: 服务状态信息

## 模板系统

### 讲座模板 (lecture.md.jinja)
- 专业的讲座风格
- 包含目录页和总结页
- 适合学术报告和课程讲解

### 简单模板 (simple.md.jinja)
- 简洁的设计风格
- 适合快速演示和简单介绍
- 页面布局更加紧凑

## 依赖要求

### Python依赖
```
Flask==2.3.2
Jinja2==3.1.2
Flask-CORS==4.0.0
requests==2.31.0
python-pptx==0.6.21
```

### 系统依赖
- **Python 3.7+**: 支持现代Python特性
- **无需Node.js或npm**: 完全基于Python生态

## 故障排除

### 常见问题

1. **python-pptx未安装**
   ```bash
   pip install python-pptx==0.6.21
   ```

2. **Python依赖缺失**
   ```bash
   pip install -r requirements.txt
   ```

3. **端口被占用**
   - 修改 `ppt_service.py` 中的端口号
   - 或停止占用端口的其他服务

4. **CORS错误**
   - 确保后端服务已启动
   - 检查前端endpoint配置是否正确

### 日志查看
- 后端日志：`server/ppt_service.log`
- 前端控制台：浏览器开发者工具

## 扩展功能

### 添加新模板
1. 在 `server/templates/` 目录下创建新的 `.md.jinja` 文件
2. 在 `PPTGenerator.tsx` 中添加模板选项
3. 重启后端服务

### 自定义样式
- 修改模板文件中的CSS样式
- 调整python-pptx幻灯片样式和布局
- 添加自定义背景和字体

### 集成其他服务
- 连接AI内容生成服务
- 集成云存储服务
- 添加用户认证和权限管理

## 贡献指南

欢迎提交Issue和Pull Request来改进这个功能！

## 许可证

本项目采用MIT许可证。 