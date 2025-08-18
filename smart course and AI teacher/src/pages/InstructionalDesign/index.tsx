import React, { useState } from 'react';
import { Button, Input, message, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import './index.scss';

const { TextArea } = Input;

interface InstructionalDesignProps {
  onBack: () => void;
}

const InstructionalDesign: React.FC<InstructionalDesignProps> = ({ onBack }) => {
  const [requirement, setRequirement] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [fileName, setFileName] = useState('instructional_design.md');

  const generateDesign = async () => {
    if (!requirement.trim()) {
      message.error('请输入教学需求');
      return;
    }

    setLoading(true);
    try {
      // 获取环境变量中的API Key，生产环境中应该通过后端服务获取
      const apiKey ='';//填写阿里云百炼SDK
      const appId ='6f812013c8424716ac9d9b2d471fc4d6'; // 替换为实际的应用ID

      if (!apiKey || !appId) {
        message.error('API配置缺失，请检查环境变量');
        setLoading(false);
        return;
      }

      const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;

      const data = {
        input: {
          prompt: `请根据以下教学需求，生成一份详细的教学设计方案：\n${requirement}`
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
        const designContent = response.data.output.text;
        setResult(designContent);
      } else {
        message.error(`请求失败: ${response.data.message || '未知错误'}`);
        console.error('API响应:', response.data);
      }
    } catch (error: any) {
      message.error(`生成教学设计失败: ${error.message}`);
      console.error('错误详情:', error);
      if (error.response) {
        console.error(`响应状态: ${error.response.status}`);
        console.error(`响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadMdFile = () => {
    if (!result) {
      message.warning('请先生成教学设计');
      return;
    }

    // 创建Blob对象
    const blob = new Blob([result], { type: 'text/markdown' });
    // 创建URL
    const url = URL.createObjectURL(blob);
    // 创建a标签
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    // 触发点击
    document.body.appendChild(a);
    a.click();
    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    message.success(`已下载文件: ${fileName}`);
  };

  return (
    <div className="instructional-design-container">
      <div className="header">
        <Button onClick={onBack}>返回</Button>
        <h1>教学设计生成器</h1>
      </div>

      <div className="content">
        <div className="input-section">
          <h2>输入教学需求</h2>
          <TextArea
            rows={6}
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="请输入详细的教学需求，例如：课程主题、目标学生群体、教学目标等"
          />
          <div className="file-name-input">
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="文件名称"
              addonAfter=".md"
              style={{ width: '300px' }}
            />
          </div>
          <Button 
            type="primary" 
            onClick={generateDesign} 
            loading={loading}
          >
            生成教学设计
          </Button>
        </div>

        <div className="result-section">
          <h2>教学设计结果</h2>
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>正在生成教学设计，请稍候...</p>
            </div>
          ) : (
            <div className="result-content">
              {result ? (
                <div className="success-result">
                  <div className="success-icon">✓</div>
                  <p>教学设计已生成成功！</p>
                  <Button type="primary" size="large" onClick={downloadMdFile} icon={<DownloadOutlined />}>
                    下载MD文件
                  </Button>
                </div>
              ) : (
                <div className="empty-result">
                  <p>请在左侧输入教学需求并点击生成按钮</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructionalDesign;