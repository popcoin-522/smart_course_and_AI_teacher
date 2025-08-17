#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
思维导图生成服务
提供思维导图生成、下载等API接口
"""

import json
import os
import uuid
from typing import Dict, List, Any, Optional
from datetime import datetime
import base64
from PIL import Image, ImageDraw, ImageFont
import io
import re

class MindMapGenerator:
    """思维导图生成器"""
    
    def __init__(self):
        # 尝试多个字体路径，优先使用系统字体
        self.font_paths = [
            "arial.ttf",
            "C:/Windows/Fonts/arial.ttf",
            "/System/Library/Fonts/Arial.ttf",
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
        ]
        self.font_path = None
        # 查找可用的字体文件
        for path in self.font_paths:
            if os.path.exists(path):
                self.font_path = path
                break
        self.default_colors = {
            'default': {
                'node': '#1890ff',
                'line': '#d9d9d9',
                'background': '#ffffff',
                'text': '#333333'
            },
            'business': {
                'node': '#52c41a',
                'line': '#8c8c8c',
                'background': '#fafafa',
                'text': '#262626'
            },
            'creative': {
                'node': '#722ed1',
                'line': '#d3adf7',
                'background': '#f9f0ff',
                'text': '#531dab'
            },
            'education': {
                'node': '#fa8c16',
                'line': '#ffd591',
                'background': '#fff7e6',
                'text': '#d46b08'
            },
            'technology': {
                'node': '#13c2c2',
                'line': '#87e8de',
                'background': '#e6fffb',
                'text': '#08979c'
            }
        }
    
    def parse_content(self, content: str) -> List[Dict[str, Any]]:
        """解析内容文本，提取主要概念和层次结构"""
        lines = content.strip().split('\n')
        nodes = []
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line:
                continue
                
            # 移除常见的列表标记
            clean_line = re.sub(r'^[-*•]\s*', '', line)
            if not clean_line:
                continue
            
            # 分析层次结构（通过缩进或特殊字符）
            level = 0
            if line.startswith('  ') or line.startswith('\t'):
                level = 1
            elif line.startswith('    ') or line.startswith('\t\t'):
                level = 2
            
            node = {
                'id': str(uuid.uuid4()),
                'text': clean_line,
                'level': level,
                'children': []
            }
            
            if level == 0:
                nodes.append(node)
            elif level == 1 and nodes:
                nodes[-1]['children'].append(node)
            elif level == 2 and nodes and nodes[-1]['children']:
                nodes[-1]['children'][-1]['children'].append(node)
        
        return nodes
    
    def generate_mind_map_data(self, title: str, description: str, content: str, 
                              theme: str = 'default', layout: str = 'radial') -> Dict[str, Any]:
        """生成思维导图数据结构"""
        nodes = self.parse_content(content)
        
        # 添加中心节点
        center_node = {
            'id': str(uuid.uuid4()),
            'text': title,
            'level': -1,
            'children': nodes
        }
        
        return {
            'title': title,
            'description': description,
            'nodes': [center_node],
            'theme': theme,
            'layout': layout,
            'generated_at': datetime.now().isoformat(),
            'node_count': len(nodes) + 1
        }
    
    def create_mind_map_image(self, mind_map_data: Dict[str, Any], 
                             style: Optional[Dict[str, str]] = None) -> Image.Image:
        """创建思维导图图片"""
        # 获取主题颜色
        theme = mind_map_data.get('theme', 'default')
        colors = self.default_colors.get(theme, self.default_colors['default'])
        
        # 应用自定义样式
        if style:
            colors.update(style)
        
        # 创建画布
        width, height = 1200, 800
        image = Image.new('RGB', (width, height), colors['background'])
        draw = ImageDraw.Draw(image)
        
        try:
            # 尝试加载字体
            font_large = ImageFont.truetype(self.font_path, 32)
            font_medium = ImageFont.truetype(self.font_path, 24)
            font_small = ImageFont.truetype(self.font_path, 18)
        except:
            # 使用默认字体
            font_large = ImageFont.load_default()
            font_medium = ImageFont.load_default()
            font_small = ImageFont.load_default()
        
        # 绘制标题
        title = mind_map_data['title']
        title_bbox = draw.textbbox((0, 0), title, font=font_large)
        title_width = title_bbox[2] - title_bbox[0]
        title_x = (width - title_width) // 2
        draw.text((title_x, 30), title, fill=colors['text'], font=font_large)
        
        # 绘制描述
        description = mind_map_data['description']
        desc_bbox = draw.textbbox((0, 0), description, font=font_small)
        desc_width = desc_bbox[2] - desc_bbox[0]
        desc_x = (width - desc_width) // 2
        draw.text((desc_x, 80), description, fill=colors['text'], font=font_small)
        
        # 绘制思维导图节点
        center_x, center_y = width // 2, 200
        self._draw_nodes(draw, mind_map_data['nodes'], center_x, center_y, 
                        colors, font_medium, font_small, layout=mind_map_data.get('layout', 'radial'))
        
        return image
    
    def _draw_nodes(self, draw: ImageDraw.Draw, nodes: List[Dict[str, Any]], 
                   center_x: int, center_y: int, colors: Dict[str, str],
                   font_medium, font_small, layout: str = 'radial'):
        """绘制节点和连接线"""
        if not nodes:
            return
        
        # 计算节点位置
        if layout == 'radial':
            self._draw_radial_layout(draw, nodes, center_x, center_y, colors, font_medium, font_small)
        elif layout == 'tree':
            self._draw_tree_layout(draw, nodes, center_x, center_y, colors, font_medium, font_small)
        elif layout == 'horizontal':
            self._draw_horizontal_layout(draw, nodes, center_x, center_y, colors, font_medium, font_small)
        else:  # vertical
            self._draw_vertical_layout(draw, nodes, center_x, center_y, colors, font_medium, font_small)
    
    def _draw_radial_layout(self, draw: ImageDraw.Draw, nodes: List[Dict[str, Any]], 
                           center_x: int, center_y: int, colors: Dict[str, str],
                           font_medium, font_small):
        """放射状布局"""
        if not nodes:
            return
        
        # 绘制中心节点
        center_node = nodes[0] if nodes else None
        if center_node:
            self._draw_node(draw, center_x, center_y, center_node['text'], 
                          colors['node'], colors['text'], font_medium, is_center=True)
        
        # 绘制其他节点
        child_nodes = nodes[1:] if len(nodes) > 1 else []
        if child_nodes:
            radius = 200
            angle_step = 2 * 3.14159 / len(child_nodes)
            
            for i, node in enumerate(child_nodes):
                angle = i * angle_step
                x = center_x + int(radius * 3.14159 * 2 * angle / (2 * 3.14159))
                y = center_y + int(radius * 3.14159 * 2 * angle / (2 * 3.14159))
                
                # 绘制连接线
                draw.line([(center_x, center_y), (x, y)], fill=colors['line'], width=3)
                
                # 绘制节点
                self._draw_node(draw, x, y, node['text'], colors['node'], colors['text'], font_small)
                
                # 递归绘制子节点
                if node.get('children'):
                    self._draw_radial_layout(draw, node['children'], x, y, colors, font_small, font_small)
    
    def _draw_tree_layout(self, draw: ImageDraw.Draw, nodes: List[Dict[str, Any]], 
                         center_x: int, center_y: int, colors: Dict[str, str],
                         font_medium, font_small):
        """树状布局"""
        if not nodes:
            return
        
        # 绘制中心节点
        center_node = nodes[0] if nodes else None
        if center_node:
            self._draw_node(draw, center_x, center_y, center_node['text'], 
                          colors['node'], colors['text'], font_medium, is_center=True)
        
        # 绘制子节点
        child_nodes = nodes[1:] if len(nodes) > 1 else []
        if child_nodes:
            y_offset = 120
            x_spacing = 300
            
            for i, node in enumerate(child_nodes):
                x = center_x + (i - len(child_nodes) // 2) * x_spacing
                y = center_y + y_offset
                
                # 绘制连接线
                draw.line([(center_x, center_y), (x, y)], fill=colors['line'], width=3)
                
                # 绘制节点
                self._draw_node(draw, x, y, node['text'], colors['node'], colors['text'], font_small)
                
                # 递归绘制子节点
                if node.get('children'):
                    self._draw_tree_layout(draw, node['children'], x, y, colors, font_small, font_small)
    
    def _draw_horizontal_layout(self, draw: ImageDraw.Draw, nodes: List[Dict[str, Any]], 
                               center_x: int, center_y: int, colors: Dict[str, str],
                               font_medium, font_small):
        """水平布局"""
        if not nodes:
            return
        
        # 绘制中心节点
        center_node = nodes[0] if nodes else None
        if center_node:
            self._draw_node(draw, center_x, center_y, center_node['text'], 
                          colors['node'], colors['text'], font_medium, is_center=True)
        
        # 绘制子节点
        child_nodes = nodes[1:] if len(nodes) > 1 else []
        if child_nodes:
            x_spacing = 250
            
            for i, node in enumerate(child_nodes):
                x = center_x + (i - len(child_nodes) // 2) * x_spacing
                y = center_y
                
                # 绘制连接线
                draw.line([(center_x, center_y), (x, y)], fill=colors['line'], width=3)
                
                # 绘制节点
                self._draw_node(draw, x, y, node['text'], colors['node'], colors['text'], font_small)
                
                # 递归绘制子节点
                if node.get('children'):
                    self._draw_horizontal_layout(draw, node['children'], x, y, colors, font_small, font_small)
    
    def _draw_vertical_layout(self, draw: ImageDraw.Draw, nodes: List[Dict[str, Any]], 
                             center_x: int, center_y: int, colors: Dict[str, str],
                             font_medium, font_small):
        """垂直布局"""
        if not nodes:
            return
        
        # 绘制中心节点
        center_node = nodes[0] if nodes else None
        if center_node:
            self._draw_node(draw, center_x, center_y, center_node['text'], 
                          colors['node'], colors['text'], font_medium, is_center=True)
        
        # 绘制子节点
        child_nodes = nodes[1:] if len(nodes) > 1 else []
        if child_nodes:
            y_spacing = 120
            x_spacing = 200
            
            for i, node in enumerate(child_nodes):
                x = center_x + (i - len(child_nodes) // 2) * x_spacing
                y = center_y + y_spacing
                
                # 绘制连接线
                draw.line([(center_x, center_y), (x, y)], fill=colors['line'], width=3)
                
                # 绘制节点
                self._draw_node(draw, x, y, node['text'], colors['node'], colors['text'], font_small)
                
                # 递归绘制子节点
                if node.get('children'):
                    self._draw_vertical_layout(draw, node['children'], x, y, colors, font_small, font_small)
    
    def _draw_node(self, draw: ImageDraw.Draw, x: int, y: int, text: str, 
                   node_color: str, text_color: str, font, is_center: bool = False):
        """绘制单个节点"""
        # 计算文本边界
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # 计算节点大小
        if is_center:
            node_radius = max(40, text_width // 2 + 20)
        else:
            node_radius = max(30, text_width // 2 + 15)
        
        # 绘制节点圆形
        draw.ellipse([x - node_radius, y - node_radius, 
                     x + node_radius, y + node_radius], 
                    fill=node_color, outline=text_color, width=2)
        
        # 绘制文本
        text_x = x - text_width // 2
        text_y = y - text_height // 2
        draw.text((text_x, text_y), text, fill=text_color, font=font)

class MindMapService:
    """思维导图服务类"""
    
    def __init__(self):
        self.generator = MindMapGenerator()
    
    def generate_mindmap(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """生成思维导图"""
        try:
            title = request_data.get('title', '思维导图')
            description = request_data.get('description', '')
            content = request_data.get('content', '')
            theme = request_data.get('theme', 'default')
            layout = request_data.get('layout', 'radial')
            style = request_data.get('style', {})
            
            # 生成思维导图数据
            mind_map_data = self.generator.generate_mind_map_data(
                title, description, content, theme, layout
            )
            
            # 创建图片
            image = self.generator.create_mind_map_image(mind_map_data, style)
            
            # 转换为base64
            buffer = io.BytesIO()
            image.save(buffer, format='PNG')
            img_str = base64.b64encode(buffer.getvalue()).decode()
            
            return {
                'success': True,
                'data': mind_map_data,
                'image_base64': img_str,
                'message': '思维导图生成成功'
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': '思维导图生成失败'
            }
    
    def download_mindmap(self, mind_map_data: Dict[str, Any]) -> bytes:
        """下载思维导图图片"""
        try:
            # 重新生成图片
            image = self.generator.create_mind_map_image(mind_map_data)
            
            # 转换为PNG格式的字节数据
            buffer = io.BytesIO()
            image.save(buffer, format='PNG')
            return buffer.getvalue()
            
        except Exception as e:
            raise Exception(f"图片生成失败: {str(e)}")

# 创建服务实例
mindmap_service = MindMapService()

def handle_generate_request(request_data: Dict[str, Any]) -> Dict[str, Any]:
    """处理生成思维导图的请求"""
    return mindmap_service.generate_mindmap(request_data)

def handle_download_request(mind_map_data: Dict[str, Any]) -> bytes:
    """处理下载思维导图的请求"""
    return mindmap_service.download_mindmap(mind_map_data)

if __name__ == "__main__":
    # 测试代码
    test_data = {
        "title": "人工智能发展历程",
        "description": "从概念到应用的完整发展脉络",
        "content": """人工智能概念
  机器学习
    深度学习
    强化学习
  自然语言处理
    机器翻译
    对话系统
  计算机视觉
    图像识别
    目标检测
  专家系统
  知识图谱""",
        "theme": "technology",
        "layout": "radial"
    }
    
    result = mindmap_service.generate_mindmap(test_data)
    print("生成结果:", json.dumps(result, ensure_ascii=False, indent=2))
