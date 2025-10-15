import React, { useState } from 'react';
import { Button, Input, message, Spin, Timeline, Tag } from 'antd';
import { DownloadOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';
import './SmartLearningPush.scss';

const { TextArea } = Input;

interface SmartLearningPushProps {
  onBack: () => void;
}

interface LearningActivity {
  title: string;
  description: string;
  duration: string;
  priority: string;
  type: string;
  resources?: string[];
}

interface LearningSchedule {
  date: string;
  activities: LearningActivity[];
}

const SmartLearningPush: React.FC<SmartLearningPushProps> = ({ onBack }) => {
  const [learningData, setLearningData] = useState('');
  const [loading, setLoading] = useState(false);
  const [learningSchedule, setLearningSchedule] = useState<LearningSchedule[]>([]);
  const [fileName, setFileName] = useState('learning_schedule.md');
  const [days, setDays] = useState<number>(7);

  const generateLearningPush = async () => {
    if (!learningData.trim()) {
      message.error('请输入学习数据');
      return;
    }

    setLoading(true);
    try {
      // 获取环境变量中的API Key
      const apiKey = process.env.DASHSCOPE_API_KEY || '';
      const appId = process.env.APP_ID || '6f812013c8424716ac9d9b2d471fc4d6';

      if (!apiKey || !appId) {
        message.warning('使用示例数据，如需真实API调用请配置环境变量');
        
        // 示例智能学习推送数据
        const sampleSchedule: LearningSchedule[] = [];
        
        // 生成未来几天的学习计划
        for (let i = 0; i < days; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
          
          let activities: LearningActivity[] = [];
          
          if (i === 0) {
            // 第一天：复习基础
            activities = [
              {
                title: "数据结构基础回顾",
                description: "重点复习链表、栈和队列的基本概念和常见操作",
                duration: "30分钟",
                priority: "高",
                type: "复习",
                resources: ["数据结构教材第2章", "相关视频教程"]
              },
              {
                title: "算法题练习",
                description: "完成5道链表相关的算法题目",
                duration: "45分钟",
                priority: "中",
                type: "练习",
                resources: ["LeetCode平台"]
              }
            ];
          } else if (i === 1) {
            // 第二天：进阶学习
            activities = [
              {
                title: "树和二叉树学习",
                description: "学习树的基本概念，二叉树的遍历算法",
                duration: "60分钟",
                priority: "高",
                type: "学习",
                resources: ["数据结构教材第5章", "视频课程"]
              },
              {
                title: "课后练习",
                description: "完成二叉树相关的练习题",
                duration: "40分钟",
                priority: "中",
                type: "练习",
                resources: ["练习册第12-15题"]
              }
            ];
          } else {
            // 其他天：综合学习
            activities = [
              {
                title: "知识拓展",
                description: "学习相关的扩展知识点，拓宽知识面",
                duration: "40分钟",
                priority: "中",
                type: "学习"
              },
              {
                title: "综合练习",
                description: "完成综合练习题，巩固所学知识",
                duration: "50分钟",
                priority: "中",
                type: "练习"
              }
            ];
          }
          
          sampleSchedule.push({
            date: formattedDate,
            activities: activities
          });
        }
        
        setLearningSchedule(sampleSchedule);
        setLoading(false);
        return;
      }

      const url = `https://dashscope.aliyuncs.com/api/v1/apps/${appId}/completion`;

      const data = {
        input: {
          prompt: `请根据以下学习数据，为用户生成${days}天的个性化学习推送计划：\n${learningData}\n\n请以JSON格式返回，包含schedule数组，每个元素包含date(日期)和activities数组，activities中的每个元素包含title(活动标题)、description(活动描述)、duration(预计时长)、priority(优先级：高/中/低)、type(活动类型：学习/复习/练习)、resources(推荐资源，数组形式)字段。`
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
          if (jsonResponse.schedule && Array.isArray(jsonResponse.schedule)) {
            setLearningSchedule(jsonResponse.schedule);
          } else {
            // 如果不是预期的JSON格式，提供示例数据
            message.warning('未能解析为预期的JSON格式，已显示示例计划');
            
            const exampleSchedule: LearningSchedule[] = [];
            for (let i = 0; i < days; i++) {
              const date = new Date();
              date.setDate(date.getDate() + i);
              const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
              
              exampleSchedule.push({
                date: formattedDate,
                activities: [
                  {
                    title: "知识点学习",
                    description: "学习相关的知识点内容",
                    duration: "45分钟",
                    priority: "中",
                    type: "学习"
                  },
                  {
                    title: "练习巩固",
                    description: "通过练习巩固所学知识",
                    duration: "30分钟",
                    priority: "中",
                    type: "练习"
                  }
                ]
              });
            }
            
            setLearningSchedule(exampleSchedule);
          }
        } catch (e) {
          // 如果JSON解析失败，显示错误信息
          message.warning('响应解析失败，显示示例计划');
          console.error('解析错误:', e);
          
          const exampleSchedule: LearningSchedule[] = [];
          for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
            
            exampleSchedule.push({
              date: formattedDate,
              activities: [
                {
                  title: "智能学习推送",
                  description: "根据你的学习情况定制的学习内容",
                  duration: "45分钟",
                  priority: "中",
                  type: "学习"
                }
              ]
            });
          }
          
          setLearningSchedule(exampleSchedule);
        }
      } else {
        message.error(`请求失败: ${response.data.message || '未知错误'}`);
        console.error('API响应:', response.data);
      }
    } catch (error: any) {
      message.error(`生成学习推送计划失败: ${error.message}`);
      console.error('错误详情:', error);
      if (error.response) {
        console.error(`响应状态: ${error.response.status}`);
        console.error(`响应数据: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const downloadSchedule = () => {
    if (!learningSchedule.length) {
      message.warning('请先生成学习推送计划');
      return;
    }

    // 生成Markdown内容
    let markdownContent = `# 智能学习推送计划\n\n## 学习数据概述\n\n${learningData}\n\n## 每日学习计划\n\n`;
    
    learningSchedule.forEach((day) => {
      markdownContent += `### ${day.date}\n\n`;
      day.activities.forEach((activity, index) => {
        markdownContent += `#### ${index + 1}. ${activity.title}\n\n`;
        markdownContent += `**描述:** ${activity.description}\n\n`;
        markdownContent += `**预计时长:** ${activity.duration}\n\n`;
        markdownContent += `**优先级:** ${activity.priority}\n\n`;
        markdownContent += `**类型:** ${activity.type}\n\n`;
        
        if (activity.resources && activity.resources.length > 0) {
          markdownContent += `**推荐资源:**\n`;
          activity.resources.forEach(resource => {
            markdownContent += `- ${resource}\n`;
          });
          markdownContent += `\n`;
        }
        
        markdownContent += `---\n\n`;
      });
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case '高':
        return 'red';
      case '中':
        return 'orange';
      case '低':
        return 'blue';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case '学习':
        return 'blue';
      case '复习':
        return 'green';
      case '练习':
        return 'purple';
      default:
        return 'default';
    }
  };

  return (
    <div className="smart-learning-push-container">
      <div className="header">
        <Button onClick={onBack} className="back-button">返回</Button>
        <h1>智能学习推送</h1>
      </div>

      <div className="content">
        <div className="input-section">
          <h2>输入学习数据</h2>
          <TextArea
            rows={6}
            value={learningData}
            onChange={(e) => setLearningData(e.target.value)}
            placeholder="请输入你的学习情况，包括学习进度、掌握程度、答题情况等，例如：我最近在学习数据结构，链表部分掌握得不够扎实，特别是链表反转和环形链表检测等题型容易出错..."
          />
          
          <div className="settings-section">
            <div className="days-setting">
              <span>生成天数：</span>
              <Input
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                style={{ width: '100px', marginLeft: '10px' }}
              />
            </div>
            
            <div className="file-name-input">
              <Input
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="文件名称"
                addonAfter=".md"
                style={{ width: '300px' }}
              />
            </div>
          </div>
          
          <div className="button-group">
            <Button 
              type="primary" 
              onClick={generateLearningPush} 
              loading={loading}
              icon={<CalendarOutlined />}
              className="generate-button"
            >
              生成学习推送计划
            </Button>
            <Button 
              icon={<DownloadOutlined />}
              onClick={downloadSchedule}
              disabled={!learningSchedule.length}
              className="download-button"
            >
              下载计划
            </Button>
          </div>
        </div>

        <div className="result-section">
          <h2>学习推送计划</h2>
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <p>正在生成学习推送计划，请稍候...</p>
            </div>
          ) : (
            <div className="result-content">
              {learningSchedule.length > 0 ? (
                <div className="schedule-content">
                  {learningSchedule.map((day, index) => (
                    <div key={index} className="day-schedule">
                      <h3 className="day-title">
                        <CalendarOutlined /> {day.date}
                      </h3>
                      <Timeline
                        items={day.activities.map((activity) => ({
                          color: getPriorityColor(activity.priority),
                          children: (
                            <div className="activity-item">
                              <h4>{activity.title}</h4>
                              <p>{activity.description}</p>
                              <div className="activity-meta">
                                <Tag color={getTypeColor(activity.type)}>{activity.type}</Tag>
                                <Tag color={getPriorityColor(activity.priority)}>{activity.priority}优先级</Tag>
                                <span className="duration">⏱️ {activity.duration}</span>
                              </div>
                              {activity.resources && activity.resources.length > 0 && (
                                <div className="resources">
                                  <strong>推荐资源：</strong>
                                  <ul>
                                    {activity.resources.map((resource, resIndex) => (
                                      <li key={resIndex}>• {resource}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )
                        }))}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>请输入学习数据并点击生成按钮</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SmartLearningPush;