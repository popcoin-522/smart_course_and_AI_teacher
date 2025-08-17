#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
启动思维导图生成服务
"""

import os
import sys
import subprocess
import time
import logging

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def check_dependencies():
    """检查依赖是否安装"""
    try:
        import flask
        import PIL
        logger.info("✓ 依赖检查通过")
        return True
    except ImportError as e:
        logger.error(f"✗ 依赖缺失: {e}")
        return False

def install_dependencies():
    """安装依赖"""
    logger.info("正在安装依赖...")
    try:
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
        ])
        logger.info("✓ 依赖安装成功")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"✗ 依赖安装失败: {e}")
        return False

def start_service():
    """启动服务"""
    logger.info("启动思维导图生成服务...")
    try:
        # 启动Flask应用
        from app import app
        app.run(
            host='0.0.0.0',
            port=5001,
            debug=False,
            threaded=True
        )
    except Exception as e:
        logger.error(f"服务启动失败: {e}")
        return False

def main():
    """主函数"""
    logger.info("=== 思维导图生成服务启动器 ===")
    
    # 检查依赖
    if not check_dependencies():
        logger.info("尝试安装依赖...")
        if not install_dependencies():
            logger.error("依赖安装失败，请手动安装")
            return
        
        # 重新检查依赖
        if not check_dependencies():
            logger.error("依赖检查失败，无法启动服务")
            return
    
    # 启动服务
    logger.info("服务启动中...")
    start_service()

if __name__ == "__main__":
    main()
