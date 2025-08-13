#!/bin/bash

echo "========================================"
echo "    智能课程平台启动脚本"
echo "========================================"
echo

echo "[1/3] 检查Python环境..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3未安装"
    echo "请先安装Python 3.7+"
    exit 1
fi
echo "✅ Python环境检查通过"

echo
echo "[2/3] 启动PPT生成后端服务..."
echo "💡 使用python-pptx生成完全可编辑的PPTX文件"
cd server
gnome-terminal --title="PPT生成服务" -- bash -c "python3 start_ppt_service.py; exec bash" &
cd ..
sleep 3

echo
echo "[3/3] 启动前端应用..."
echo "✅ 正在启动前端应用..."
gnome-terminal --title="智能课程平台" -- bash -c "npm run dev; exec bash" &

echo
echo "========================================"
echo "🎉 项目启动完成！"
echo "========================================"
echo
echo "📱 前端应用: http://localhost:5173"
echo "🔧 后端服务: http://localhost:5000"
echo
echo "💡 技术特点:"
echo "   ✅ 使用python-pptx生成原生PPTX文件"
echo "   ✅ 生成的文件完全可编辑"
echo "   ✅ 支持PowerPoint、WPS等所有Office软件"
echo "   ✅ 无需安装Node.js或Marp CLI"
echo
echo "💡 提示:"
echo "   - 前端应用会自动在浏览器中打开"
echo "   - 后端服务会在新窗口中运行"
echo "   - 关闭窗口即可停止相应服务"
echo
echo "按任意键退出..."
read -n 1 