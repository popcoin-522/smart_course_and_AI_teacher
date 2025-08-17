#!/bin/bash

echo "========================================"
echo "🧠 思维导图生成服务启动器"
echo "========================================"
echo

echo "正在检查Python环境..."
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到Python3环境，请先安装Python 3.8+"
    exit 1
fi

echo "✅ Python环境检查通过"
echo

echo "正在检查依赖..."
if ! python3 -c "import flask, PIL" &> /dev/null; then
    echo "📦 正在安装依赖..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败，请检查网络连接或手动安装"
        exit 1
    fi
    echo "✅ 依赖安装成功"
else
    echo "✅ 依赖检查通过"
fi

echo
echo "🚀 启动思维导图生成服务..."
echo "📍 服务地址: http://localhost:5001"
echo "📍 API文档: http://localhost:5001/"
echo
echo "按 Ctrl+C 停止服务"
echo

python3 app.py
