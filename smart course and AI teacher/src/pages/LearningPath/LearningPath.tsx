import React, { useState } from 'react';
import { Button, Input, message, Spin, Steps } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import './LearningPath.scss';

const { TextArea } = Input;
// 移除未使用的解构赋值，因为代码中未使用 Step 变量

interface LearningPathProps {
  onBack: () => void;
}

interface PathStep {
  title: string;
  description: string;
}

const LearningPath: React.FC<LearningPathProps> = ({ onBack }) => {
  const [learningGoal, setLearningGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [learningPath, setLearningPath] = useState<PathStep[]>([]);
  const [fileName, setFileName] = useState('learning_path.md');

  const generateLearningPath = async () => {
    if (!learningGoal.trim()) {
      message.error('请输入学习目标');
      return;
    }

    setLoading(true);
    try {
      // 获取环境变量中的API Key
      const apiKey = process.env.DASHSCOPE_API_KEY || '';
      const appId = process.env.APP_ID || '6f812013c8424716ac9d9b2d471fc4d6';

      if (!apiKey || !appId) {
        message.warning('使用示例数据，如需真实API调用请配置环境变量');
        
        // 示例学习路径数据
        const sampleLearningPath = [
          { title: "基础知识准备", description: "了解学习目标相关的基本概念和背景知识，建立知识框架" },
          { title: "核心理论学习", description: "深入学习主要理论体系，掌握关键原理和方法" },
          { title: "实践技能训练", description: "通过实际案例练习，巩固所学知识并提高应用能力" },
          { title: "知识拓展与深化", description: "学习相关扩展内容，拓宽知识面，深化理解" },
          { title: "综合应用与创新", description: "综合运用所学知识解决实际问题，尝试创新应用" },
          { title: "总结与评估", description: "总结学习成果，进行自我评估，确定后续学习方向" }
        ];
        
        setLearningPath(sampleLearningPath);
        setLoading(false);
        return;
      }

      const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;

      const data = {
        input: {
          prompt: `请根据以下学习目标，生成一份详细的学习路径：\n${learningGoal}\n\n请以JSON格式返回，包含steps数组，每个元素包含title和description字段。`
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
        try {
          // 尝试解析JSON响应
          const jsonResponse = JSON.parse(response.data.output.text);
          if (jsonResponse.steps && Array.isArray(jsonResponse.steps)) {
            setLearningPath(jsonResponse.steps);
          } else {
            // 如果不是预期的JSON格式，作为文本处理
            message.warning('未能解析为预期的JSON格式，已显示原始文本');
            console.log('原始响应:', response.data.output.text);
            // 模拟创建步骤数据
            setLearningPath([
              { title: '开始阶段', description: '了解基础知识和概念' },
              { title: '进阶阶段', description: '深入学习核心内容和技能' },
              { title: '实践阶段', description: '通过项目和练习巩固知识' },
              { title: '深化阶段', description: '探索高级主题和前沿应用' },
              { title: '总结阶段', description: '回顾与巩固学习成果' }
            ]);
          }
        } catch (e) {
          // 如果JSON解析失败，显示错误信息
          message.warning('响应解析失败，显示示例路径');
          console.error('解析错误:', e);
          // 提供示例路径
          setLearningPath([
            { title: '开始阶段', description: '了解基础知识和概念' },
            { title: '进阶阶段', description: '深入学习核心内容和技能' },
            { title: '实践阶段', description: '通过项目和练习巩固知识' },
            { title: '深化阶段', description: '探索高级主题和前沿应用' },
            { title: '总结阶段', description: '回顾与巩固学习成果' }
          ]);
        }
      } else {
        message.error(`请求失败: ${response.data.message || '未知错误'}`);
        console.error('API响应:', response.data);
      }
    } catch (error: any) {
      message.error(`生成学习路径失败: ${error.message}`);
      console.error('错误详情:', error);
      if (error.response) {
        console.error(`响应状态: ${error.response.status}`);
        console.error(`响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadLearningPath = () => {
    if (!learningPath.length) {
      message.warning('请先生成学习路径');
      return;
    }

    // 生成Markdown内容
    let markdownContent = `# 学习路径: ${learningGoal}\n\n`;
    learningPath.forEach((step, index) => {
      markdownContent += `## ${index + 1}. ${step.title}\n\n${step.description}\n\n`;
    });

    // 创建Blob对象
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
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
    <div className="learning-path-container">
      <div className="header">
        <Button onClick={onBack} className="back-button">返回</Button>
        <h1>学习路径生成器</h1>
      </div>

      <div className="content">
        <div className="input-section">
          <h2>输入学习目标</h2>
          <TextArea
            rows={6}
            value={learningGoal}
            onChange={(e) => setLearningGoal(e.target.value)}
            placeholder="请输入详细的学习目标，例如：掌握React基础知识、学习数据分析技能等"
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
            onClick={generateLearningPath} 
            loading={loading}
            className="generate-button"
          >
            生成学习路径
          </Button>
        </div>

        <div className="result-section">
          <h2>学习路径结果</h2>
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>正在生成学习路径，请稍候...</p>
            </div>
          ) : (
            <div className="result-content">
              {learningPath.length > 0 ? (
                <div className="path-result">
                  <Steps
                    direction="vertical"
                    current={-1}
                    items={learningPath.map((step) => ({
                      title: step.title,
                      description: step.description,
                    }))}
                  />
                  <div className="download-button-container">
                    <Button type="primary" size="large" onClick={downloadLearningPath} icon={<DownloadOutlined />} className="download-button">
                      下载学习路径
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="empty-result">
                  <p>请在左侧输入学习目标并点击生成按钮</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningPath;