import React, { useState, useEffect } from 'react';
import { Button, Input, message, Spin } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import './index.scss';

// 初始化markdown-it实例
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

const { TextArea } = Input;

interface KnowledgeBaseProps {
  onBack: () => void;
}

const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({ onBack }) => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [renderedHtml, setRenderedHtml] = useState('');
  
  // 当result变化时更新渲染的HTML
  useEffect(() => {
    if (result) {
      setRenderedHtml(md.render(result));
    }
  }, [result]);
  const [fileName, setFileName] = useState('knowledge_base_answer.md');

  const generateAnswer = async () => {
    if (!question.trim()) {
      message.error('请输入问题');
      return;
    }

    setLoading(true);
    try {
      // 获取环境变量中的API Key，生产环境中应该通过后端服务获取
      const apiKey ='sk-f1d456baad314d28866a4cb094d4317d';//填写阿里云百炼SDK
      const appId = '8f699dbc0fe54297b4c435c8e92c99ae'; // 替换为实际的应用ID

      if (!apiKey || !appId) {
        message.error('API配置缺失，请检查环境变量');
        setLoading(false);
        return;
      }

      const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;

      const data = {
        input: {
          prompt: question
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
        const answerContent = response.data.output.text;
        setResult(answerContent);
        // HTML渲染会通过useEffect自动处理
      } else {
        message.error(`请求失败: ${response.data.message || '未知错误'}`);
        console.error('API响应:', response.data);
      }
    } catch (error: any) {
      message.error(`生成失败: ${error.message}`);
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
      message.warning('请先生成答案');
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
    <div className="knowledge-base-container">
      <div className="header">
        <Button onClick={onBack}>返回</Button>
        <h1>个性化知识库</h1>
      </div>

      <div className="content">
        <div className="input-section">
          <h2>输入问题</h2>
          <TextArea
            rows={6}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="请输入问题"
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
            onClick={generateAnswer} 
            loading={loading}
          >
            确定
          </Button>
        </div>

        <div className="result-section">
          <h2>结果</h2>
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>正在生成中，请稍候...</p>
            </div>
          ) : (
            <div className="result-content">
              {result ? (
                <div className="success-result">
                  <div className="success-icon">✓</div>
                  <p>生成成功！</p>
                  <div className="answer-content">
                    <div className="markdown-preview" dangerouslySetInnerHTML={{ __html: renderedHtml }} />
                  </div>
                  <Button type="primary" size="large" onClick={downloadMdFile} icon={<DownloadOutlined />}>
                    下载MD文件
                  </Button>
                </div>
              ) : (
                <div className="empty-result">
                  <p>请在上方输入框输入并点击生成按钮</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KnowledgeBase;