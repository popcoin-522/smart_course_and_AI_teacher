#!/usr/bin/env python3
"""
PPT生成服务启动脚本
"""

import os
import sys
import subprocess
import time

def check_dependencies():
    """检查依赖是否安装"""
    try:
        import flask
        import jinja2
        from pptx import Presentation
        print("✓ Flask、Jinja2和python-pptx已安装")
    except ImportError as e:
        print(f"✗ 缺少依赖: {e}")
        print("请运行: pip install -r requirements.txt")
        return False
    
    print("💡 使用python-pptx生成可编辑的PPTX文件")
    
    return True

def create_directories():
    """创建必要的目录"""
    directories = ['temp', 'static/pptx']
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ 目录已创建: {directory}")

def start_service():
    """启动服务"""
    print("\n🚀 启动PPT生成服务...")
    
    if not check_dependencies():
        return False
    
    create_directories()
    
    try:
        from ppt_service import app
        print("✓ 服务启动成功!")
        print("🌐 访问地址: http://localhost:5000")
        print("📖 API文档: http://localhost:5000/")
        print("💚 健康检查: http://localhost:5000/api/health")
        print("\n按 Ctrl+C 停止服务")
        
        app.run(host='0.0.0.0', port=5000, debug=True)
        
    except Exception as e:
        print(f"✗ 服务启动失败: {e}")
        return False
    
    return True

if __name__ == '__main__':
    try:
        start_service()
    except KeyboardInterrupt:
        print("\n\n👋 服务已停止")
    except Exception as e:
        print(f"\n❌ 服务异常退出: {e}")
        sys.exit(1) 