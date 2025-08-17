@echo off
chcp 65001 >nul
echo ========================================
echo    智能课程平台启动脚本
echo ========================================
echo.

echo [1/4] 检查Python环境...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装或未添加到PATH
    echo 请先安装Python 3.7+
    pause
    exit /b 1
)
echo ✅ Python环境检查通过

echo.
echo [2/4] 启动PPT生成后端服务...
echo 💡 使用python-pptx生成完全可编辑的PPTX文件
cd server
start "PPT生成服务" cmd /k "python start_ppt_service.py"
cd ..
timeout /t 3 /nobreak >nul

echo.
echo [3/4] 启动思维导图生成后端服务...
echo 💡 使用Flask和Pillow生成思维导图图片
cd pages\create_mindmap
start "思维导图服务" cmd /k "python app.py"
cd ..\..
timeout /t 3 /nobreak >nul

echo.
echo [4/4] 启动前端应用...
echo ✅ 正在启动前端应用...
start "智能课程平台" cmd /k "npm run dev"

echo.
echo ========================================
echo 🎉 项目启动完成！
echo ========================================
echo.
echo 📱 前端应用: http://localhost:5173
echo 🔧 PPT后端服务: http://localhost:5000
echo 🧠 思维导图服务: http://localhost:5001
echo.
echo 💡 技术特点:
echo    ✅ 使用python-pptx生成原生PPTX文件
echo    ✅ 生成的文件完全可编辑
echo    ✅ 支持PowerPoint、WPS等所有Office软件
echo    ✅ 无需安装Node.js或Marp CLI
echo    ✅ 使用Flask和Pillow生成思维导图
echo    ✅ 支持多种布局和主题样式
echo.
echo 💡 提示:
echo    - 前端应用会自动在浏览器中打开
echo    - 后端服务会在新窗口中运行
echo    - 关闭窗口即可停止相应服务
echo.
pause 