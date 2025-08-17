#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
思维导图生成服务 - Flask API
提供思维导图生成、下载等HTTP接口
"""

from flask import Flask, request, jsonify, send_file, render_template
from flask_cors import CORS
import json
import io
import os
import sys
from datetime import datetime
import logging

# 添加当前目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# 导入思维导图服务
from mindmap_service import MindMapService, handle_generate_request, handle_download_request

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 创建Flask应用
app = Flask(__name__)
CORS(app)  # 启用跨域支持

# 创建思维导图服务实例
mindmap_service = MindMapService()

@app.route('/')
def index():
    """首页"""
    return render_template('index.html')

@app.route('/api/mindmap/generate', methods=['POST'])
def generate_mindmap():
    """生成思维导图API"""
    try:
        # 获取请求数据
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        logger.info(f"收到思维导图生成请求: {data.get('title', 'Unknown')}")
        
        # 验证必要字段
        required_fields = ['title', 'content']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'缺少必要字段: {field}',
                    'message': '请提供完整的思维导图信息'
                }), 400
        
        # 调用服务生成思维导图
        result = handle_generate_request(data)
        
        if result['success']:
            logger.info(f"思维导图生成成功: {data.get('title')}")
            return jsonify(result)
        else:
            logger.error(f"思维导图生成失败: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"思维导图生成异常: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': '服务器内部错误'
        }), 500

@app.route('/api/mindmap/download', methods=['POST'])
def download_mindmap():
    """下载思维导图API"""
    try:
        # 获取请求数据
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        logger.info(f"收到思维导图下载请求: {data.get('title', 'Unknown')}")
        
        # 验证必要字段
        if not data.get('nodes'):
            return jsonify({
                'success': False,
                'error': '缺少思维导图数据',
                'message': '请提供完整的思维导图数据'
            }), 400
        
        # 调用服务生成图片
        image_data = handle_download_request(data)
        
        # 创建内存文件对象
        img_io = io.BytesIO(image_data)
        img_io.seek(0)
        
        # 生成文件名
        filename = f"{data.get('title', 'mindmap')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
        
        logger.info(f"思维导图下载成功: {filename}")
        
        # 返回图片文件
        return send_file(
            img_io,
            mimetype='image/png',
            as_attachment=True,
            download_name=filename
        )
        
    except Exception as e:
        logger.error(f"思维导图下载异常: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': '下载失败'
        }), 500

@app.route('/api/mindmap/preview', methods=['POST'])
def preview_mindmap():
    """预览思维导图API（返回base64图片）"""
    try:
        # 获取请求数据
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        logger.info(f"收到思维导图预览请求: {data.get('title', 'Unknown')}")
        
        # 验证必要字段
        required_fields = ['title', 'content']
        for field in required_fields:
            if not data.get(field):
                return jsonify({
                    'success': False,
                    'error': f'缺少必要字段: {field}',
                    'message': '请提供完整的思维导图信息'
                }), 400
        
        # 调用服务生成思维导图
        result = handle_generate_request(data)
        
        if result['success']:
            logger.info(f"思维导图预览生成成功: {data.get('title')}")
            return jsonify({
                'success': True,
                'image_base64': result.get('image_base64'),
                'message': '预览生成成功'
            })
        else:
            logger.error(f"思维导图预览生成失败: {result.get('error')}")
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"思维导图预览异常: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': '服务器内部错误'
        }), 500

@app.route('/api/mindmap/themes', methods=['GET'])
def get_themes():
    """获取可用的主题列表"""
    try:
        themes = [
            {'value': 'default', 'label': '默认主题', 'description': '经典蓝白配色'},
            {'value': 'business', 'label': '商务主题', 'description': '专业绿色配色'},
            {'value': 'creative', 'label': '创意主题', 'description': '紫色创意配色'},
            {'value': 'education', 'label': '教育主题', 'description': '橙色活力配色'},
            {'value': 'technology', 'label': '科技主题', 'description': '青色科技配色'}
        ]
        
        return jsonify({
            'success': True,
            'data': themes,
            'message': '获取主题列表成功'
        })
        
    except Exception as e:
        logger.error(f"获取主题列表异常: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': '获取主题列表失败'
        }), 500

@app.route('/api/mindmap/layouts', methods=['GET'])
def get_layouts():
    """获取可用的布局列表"""
    try:
        layouts = [
            {'value': 'radial', 'label': '放射状布局', 'description': '从中心向外发散'},
            {'value': 'tree', 'label': '树状布局', 'description': '自上而下的层次结构'},
            {'value': 'horizontal', 'label': '水平布局', 'description': '从左到右的排列'},
            {'value': 'vertical', 'label': '垂直布局', 'description': '从上到下的排列'}
        ]
        
        return jsonify({
            'success': True,
            'data': layouts,
            'message': '获取布局列表成功'
        })
        
    except Exception as e:
        logger.error(f"获取布局列表异常: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
            'message': '获取布局列表失败'
        }), 500

@app.route('/api/mindmap/health', methods=['GET'])
def health_check():
    """健康检查接口"""
    return jsonify({
        'success': True,
        'message': '思维导图服务运行正常',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found(error):
    """404错误处理"""
    return jsonify({
        'success': False,
        'error': '接口不存在',
        'message': '请求的接口未找到'
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """500错误处理"""
    return jsonify({
        'success': False,
        'error': '服务器内部错误',
        'message': '服务器处理请求时发生错误'
    }), 500

if __name__ == '__main__':
    # 启动Flask应用
    logger.info("启动思维导图生成服务...")
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=True,
        threaded=True
    )
