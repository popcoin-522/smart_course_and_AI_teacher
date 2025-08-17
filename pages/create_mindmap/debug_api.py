#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
思维导图API调试脚本
用于检查API是否正常工作
"""

import requests
import json

def test_health_check():
    """测试健康检查"""
    try:
        response = requests.get('http://localhost:5001/api/mindmap/health')
        print(f"健康检查: {response.status_code}")
        if response.status_code == 200:
            print("✅ 健康检查通过")
            print(f"响应: {response.text}")
            return True
        else:
            print("❌ 健康检查失败")
            print(f"响应: {response.text}")
            return False
    except Exception as e:
        print(f"❌ 健康检查异常: {e}")
        return False

def test_generate_api():
    """测试生成API"""
    try:
        test_data = {
            "title": "测试思维导图",
            "description": "这是一个测试",
            "content": "中心主题\n  子主题1\n  子主题2",
            "theme": "default",
            "layout": "radial"
        }
        
        response = requests.post(
            'http://localhost:5001/api/mindmap/generate',
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"生成API: {response.status_code}")
        if response.status_code == 200:
            print("✅ 生成API正常")
            data = response.json()
            print(f"响应数据: {json.dumps(data, ensure_ascii=False, indent=2)}")
            return data
        else:
            print("❌ 生成API失败")
            print(f"响应: {response.text}")
            return None
    except Exception as e:
        print(f"❌ 生成API异常: {e}")
        return None

def test_download_api(mindmap_data):
    """测试下载API"""
    if not mindmap_data:
        print("❌ 没有思维导图数据，跳过下载测试")
        return False
    
    try:
        response = requests.post(
            'http://localhost:5001/api/mindmap/download',
            json=mindmap_data,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"下载API: {response.status_code}")
        if response.status_code == 200:
            print("✅ 下载API正常")
            print(f"文件大小: {len(response.content)} 字节")
            print(f"内容类型: {response.headers.get('content-type')}")
            return True
        else:
            print("❌ 下载API失败")
            print(f"响应: {response.text}")
            return False
    except Exception as e:
        print(f"❌ 下载API异常: {e}")
        return False

def main():
    """主函数"""
    print("🧠 思维导图API调试")
    print("=" * 50)
    
    # 测试健康检查
    if not test_health_check():
        print("\n❌ 服务不可用，请检查思维导图服务是否启动")
        return
    
    print("\n✅ 服务可用，继续测试...")
    
    # 测试生成API
    mindmap_data = test_generate_api()
    
    # 测试下载API
    if mindmap_data:
        test_download_api(mindmap_data)
    
    print("\n" + "=" * 50)
    print("🎉 调试完成！")

if __name__ == "__main__":
    main()
