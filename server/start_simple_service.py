#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import subprocess
import sys
import os

def check_dependencies():
    """检查依赖"""
    print("🔍 检查依赖...")
    
    # 检查Python版本
    if sys.version_info < (3, 7):
        print("❌ 需要Python 3.7或更高版本")
        return False
    
    print("✅ Python版本检查通过")
    
    # 检查pip
    try:
        subprocess.run([sys.executable, '-m', 'pip', '--version'], check=True, capture_output=True)
        print("✅ pip可用")
    except subprocess.CalledProcessError:
        print("❌ pip不可用")
        return False
    
    # 检查Flask
    try:
        import flask
        print("✅ Flask已安装")
    except ImportError:
        print("📦 安装Flask...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'flask'], check=True)
        print("✅ Flask安装成功")
    
    # 检查Flask-CORS
    try:
        import flask_cors
        print("✅ Flask-CORS已安装")
    except ImportError:
        print("📦 安装Flask-CORS...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'flask-cors'], check=True)
        print("✅ Flask-CORS安装成功")
    
    # 检查python-pptx
    try:
        import pptx
        print("✅ python-pptx已安装")
    except ImportError:
        print("📦 安装python-pptx...")
        subprocess.run([sys.executable, '-m', 'pip', 'install', 'python-pptx'], check=True)
        print("✅ python-pptx安装成功")
    
    return True

def create_directories():
    """创建必要的目录"""
    print("📁 创建目录...")
    
    dirs = ['static/pptx']
    for dir_path in dirs:
        try:
            os.makedirs(dir_path, exist_ok=True)
            print(f"✅ 目录已创建: {dir_path}")
        except Exception as e:
            print(f"❌ 创建目录失败 {dir_path}: {e}")
            return False
    
    return True

def main():
    """主函数"""
    print("🚀 启动PPT生成服务 (简化版本)...")
    print("✅ 生成完全可编辑的PPTX文件")
    print("✅ 兼容PowerPoint、WPS等所有Office软件")
    print("✅ 支持添加、删除、修改幻灯片")
    print("✅ 简化设计，提高稳定性")
    print()
    
    # 检查依赖
    if not check_dependencies():
        print("❌ 依赖检查失败")
        return
    
    # 创建目录
    if not create_directories():
        print("❌ 目录创建失败")
        return
    
    print("🎉 所有检查通过！")
    print("💡 提示: 这个版本生成的PPT完全可编辑！")
    print()
    
    # 启动服务
    try:
        print("🚀 启动服务...")
        subprocess.run([sys.executable, 'ppt_service_simple.py'])
    except KeyboardInterrupt:
        print("\n👋 服务已停止")
    except Exception as e:
        print(f"❌ 服务启动失败: {e}")

if __name__ == '__main__':
    main() 