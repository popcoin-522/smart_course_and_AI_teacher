import React, { useState } from 'react';
import { Button, Input, message, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import './PPTGenerator.scss';

const { TextArea } = Input;

interface PPTGeneratorProps {
  onBack: () => void;
}

const PPTGenerator: React.FC<PPTGeneratorProps> = ({ onBack }) => {
  const [requirement, setRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [fileName, setFileName] = useState('presentation.pptx');

  const generatePPT = async () => {
    if (!requirement.trim()) {
      message.error('请输入PPT内容需求');
      return;
    }

    setLoading(true);
    try {
      // 获取环境变量中的API Key
      const apiKey = process.env.DASHSCOPE_API_KEY || '';
      const appId = process.env.APP_ID || '6f812013c8424716ac9d9b2d471fc4d6';

      // 如果没有API密钥，使用示例数据
      if (!apiKey || !appId) {
        message.warning('使用示例数据，如需真实API调用请配置环境变量');
        
        // 示例PPT内容
        const samplePPT = `# 示例PPT大纲

## 一、课程介绍
- 课程背景
- 学习目标
- 适用人群

## 二、主要内容
### 2.1 基础概念
- 概念1解释
- 概念2解释

### 2.2 核心原理
- 原理分析
- 图解说明

### 2.3 实践案例
- 案例1展示
- 案例2展示

## 三、总结与展望
- 主要知识点回顾
- 未来应用方向
- Q&A环节`;
        
        setResult(samplePPT);
        setLoading(false);
        return;
      }

      // 有API密钥时调用真实API
      try {
        const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;

        const data = {
          input: {
            prompt: `请根据以下需求，生成一份详细的PPT内容大纲：\n${requirement}`
          },
          parameters: {},
          debug: {}
        };

        const response = await axios.post(url, data, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 200 && response.data.output?.text) {
          const pptContent = response.data.output.text;
          setResult(pptContent);
        } else {
          message.error(`请求失败: ${response.data.message || '未知错误'}`);
          console.error('API响应:', response.data);
        }
      } catch (apiError) {
        message.error('API调用失败，使用示例数据');
        console.error('API错误:', apiError);
        
        // 调用失败时也展示示例数据
        const samplePPT = `# 示例PPT大纲

## 一、课程介绍
- 课程背景
- 学习目标
- 适用人群

## 二、主要内容
### 2.1 基础概念
- 概念1解释
- 概念2解释

### 2.2 核心原理
- 原理分析
- 图解说明

### 2.3 实践案例
- 案例1展示
- 案例2展示

## 三、总结与展望
- 主要知识点回顾
- 未来应用方向
- Q&A环节`;
        
        setResult(samplePPT);
      }
    } catch (error: any) {
      message.error(`生成PPT内容失败: ${error.message}`);
      console.error('错误详情:', error);
      if (error.response) {
        console.error(`响应状态: ${error.response.status}`);
        console.error(`响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadPPTContent = () => {
    if (!result) {
      message.warning('请先生成PPT内容');
      return;
    }

    // 创建Blob对象
    const blob = new Blob([result], { type: 'text/plain' });
    // 创建URL
    const url = URL.createObjectURL(blob);
    // 创建a标签
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.replace('.pptx', '.txt');
    // 触发点击
    document.body.appendChild(a);
    a.click();
    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success(`已下载文件: ${fileName.replace('.pptx', '.txt')}`);
  };

  return (
    <div className="ppt-generator-container">
      <div className="header">
        <Button onClick={onBack} className="back-button">返回</Button>
        <h1>PPT生成器</h1>
      </div>

      <div className="content">
        <div className="input-section">
          <h2>输入PPT需求</h2>
          <TextArea
            rows={6}
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="请输入详细的PPT需求，例如：主题、内容要点、目标观众等"
          />
          <div className="file-name-input">
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="文件名称"
              style={{ width: '300px' }}
            />
          </div>
          <Button 
            type="primary" 
            onClick={generatePPT} 
            loading={loading}
            className="generate-button"
          >
            生成PPT内容
          </Button>
        </div>

        <div className="result-section">
          <h2>PPT内容结果</h2>
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>正在生成PPT内容，请稍候...</p>
            </div>
          ) : (
            <div className="result-content">
              {result ? (
                <div className="success-result">
                  <div className="success-icon">✓</div>
                  <p>PPT内容已生成成功！</p>
                  <Button type="primary" size="large" onClick={downloadPPTContent} icon={<DownloadOutlined />} className="download-button">
                    下载内容文件
                  </Button>
                </div>
              ) : (
                <div className="empty-result">
                  <p>请在左侧输入PPT需求并点击生成按钮</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PPTGenerator;