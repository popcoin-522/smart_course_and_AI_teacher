import React, { useState, useRef, useEffect } from 'react';
import { 
  Button, 
  Form, 
  Input, 
  Select, 
  Space, 
  message, 
  Card, 
  Divider,
  Spin,
  Typography,
  Row,
  Col,
  Upload,
  Modal
} from 'antd';
import { 
  UploadOutlined, 
  DownloadOutlined, 
  EyeOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useForm } from 'antd/es/form/Form';
import { MINDMAP_CONFIG, DEFAULT_CONFIG } from './config';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const { Option } = Select;

interface MindMapNode {
  id: string;
  text: string;
  children?: MindMapNode[];
  x?: number;
  y?: number;
}

interface MindMapData {
  title: string;
  description: string;
  content?: string;
  nodes: MindMapNode[];
  theme: string;
  layout: string;
  style?: {
    nodeColor: string;
    lineColor: string;
    backgroundColor: string;
  };
}

const MindMapGenerator: React.FC = () => {
  const [form] = useForm();
  const [loading, setLoading] = useState(false);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 思维导图主题选项
  const themeOptions = [
    { value: 'default', label: '默认主题' },
    { value: 'business', label: '商务主题' },
    { value: 'creative', label: '创意主题' },
    { value: 'education', label: '教育主题' },
    { value: 'technology', label: '科技主题' }
  ];

  // 布局选项
  const layoutOptions = [
    { value: 'radial', label: '放射状布局' },
    { value: 'tree', label: '树状布局' },
    { value: 'horizontal', label: '水平布局' },
    { value: 'vertical', label: '垂直布局' }
  ];

  // 生成思维导图
  const generateMindMap = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // 构建请求数据
      const requestData = {
        title: values.title,
        description: values.description,
        content: values.content,
        theme: values.theme || DEFAULT_CONFIG.DEFAULT_THEME,
        layout: values.layout || DEFAULT_CONFIG.DEFAULT_LAYOUT,
        style: {
          nodeColor: values.nodeColor || DEFAULT_CONFIG.DEFAULT_COLORS.nodeColor,
          lineColor: values.lineColor || DEFAULT_CONFIG.DEFAULT_COLORS.lineColor,
          backgroundColor: values.backgroundColor || DEFAULT_CONFIG.DEFAULT_COLORS.backgroundColor
        }
      };

      // 调用后端API
      const response = await fetch(MINDMAP_CONFIG.getGenerateUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // 确保数据结构完整
      const completeData: MindMapData = {
        title: data.data?.title || data.title || '',
        description: data.data?.description || data.description || '',
        content: data.data?.content || data.content || '',
        nodes: data.data?.nodes || data.nodes || [],
        theme: data.data?.theme || data.theme || 'default',
        layout: data.data?.layout || data.layout || 'radial',
        style: {
          nodeColor: data.data?.style?.nodeColor || data.style?.nodeColor || DEFAULT_CONFIG.DEFAULT_COLORS.nodeColor,
          lineColor: data.data?.style?.lineColor || data.style?.lineColor || DEFAULT_CONFIG.DEFAULT_COLORS.lineColor,
          backgroundColor: data.data?.style?.backgroundColor || data.style?.backgroundColor || DEFAULT_CONFIG.DEFAULT_COLORS.backgroundColor
        }
      };
      
      setMindMapData(completeData);
      message.success('思维导图生成成功！');
      
      // 强制立即渲染，确保Canvas更新
      setTimeout(() => {
        if (canvasRef.current) {
          renderMindMap();
        }
      }, 100);
    } catch (error: any) {
      console.error('生成思维导图失败:', error);
      message.error(`生成失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 预览思维导图
  const previewMindMap = () => {
    if (!mindMapData) {
      message.warning('请先生成思维导图');
      return;
    }
    setPreviewVisible(true);
    // 延迟渲染，确保模态框完全打开后再渲染
    setTimeout(() => {
      if (canvasRef.current) {
        renderMindMap();
      }
    }, 100);
  };

  // 下载思维导图
  const downloadMindMap = async () => {
    if (!mindMapData) {
      message.warning('请先生成思维导图');
      return;
    }

    try {
      setLoading(true);
      
      // 构建完整的下载数据，确保包含所有必要字段
      const downloadData = {
        title: mindMapData.title,
        description: mindMapData.description,
        content: mindMapData.content || '', // 添加content字段
        theme: mindMapData.theme,
        layout: mindMapData.layout,
        nodes: mindMapData.nodes,
        style: {
          nodeColor: mindMapData.style?.nodeColor || DEFAULT_CONFIG.DEFAULT_COLORS.nodeColor,
          lineColor: mindMapData.style?.lineColor || DEFAULT_CONFIG.DEFAULT_COLORS.lineColor,
          backgroundColor: mindMapData.style?.backgroundColor || DEFAULT_CONFIG.DEFAULT_COLORS.backgroundColor
        }
      };
      
      const response = await fetch(MINDMAP_CONFIG.getDownloadUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(downloadData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${mindMapData.title || 'mindmap'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      message.success('下载成功！');
    } catch (error: any) {
      console.error('下载失败:', error);
      message.error(`下载失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 渲染思维导图到Canvas
  useEffect(() => {
    if (mindMapData && mindMapData.nodes && canvasRef.current) {
      renderMindMap();
    }
  }, [mindMapData]);

  const renderMindMap = () => {
    const canvas = canvasRef.current;
    if (!canvas || !mindMapData || !mindMapData.nodes) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 添加调试日志
    console.log('渲染思维导图:', {
      title: mindMapData.title,
      nodesCount: mindMapData.nodes.length,
      nodes: mindMapData.nodes
    });

    // 完全重置Canvas状态
    canvas.width = 800;
    canvas.height = 600;
    
    // 清空画布并设置背景
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = mindMapData.style?.backgroundColor || DEFAULT_CONFIG.DEFAULT_COLORS.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制标题
    ctx.font = 'bold 24px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.fillText(mindMapData.title, canvas.width / 2, 40);

    // 绘制描述
    ctx.font = '16px Arial';
    ctx.fillStyle = '#666';
    ctx.fillText(mindMapData.description, canvas.width / 2, 70);

    // 绘制中心节点（标题）
    const centerX = canvas.width / 2;
    const centerY = 120;
    
    // 绘制中心节点
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50, 0, 2 * Math.PI);
    ctx.fillStyle = mindMapData.style?.nodeColor || DEFAULT_CONFIG.DEFAULT_COLORS.nodeColor;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 绘制中心节点文本
    drawWrappedText(ctx, mindMapData.title, centerX, centerY, 80, '#fff', 'bold 16px Arial');
    
    // 绘制子节点
    if (mindMapData.nodes && mindMapData.nodes.length > 0) {
      drawNodes(ctx, mindMapData.nodes, centerX, centerY);
    }
  };

  // 绘制换行文本
  const drawWrappedText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, color: string, font: string) => {
    ctx.font = font;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    
    const words = text.split('');
    let line = '';
    let lineHeight = 20;
    let currentY = y - (lineHeight * 0.5);
    
    for (let i = 0; i < words.length; i++) {
      const testLine = line + words[i];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      
      if (testWidth > maxWidth && line !== '') {
        ctx.fillText(line, x, currentY);
        line = words[i];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    
    // 绘制最后一行
    if (line) {
      ctx.fillText(line, x, currentY);
    }
  };

  const drawNodes = (ctx: CanvasRenderingContext2D, nodes: MindMapNode[], centerX: number, centerY: number) => {
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) return;
    
    // 使用主题颜色
    const nodeColor = mindMapData?.style?.nodeColor || DEFAULT_CONFIG.DEFAULT_COLORS.nodeColor;
    const lineColor = mindMapData?.style?.lineColor || DEFAULT_CONFIG.DEFAULT_COLORS.lineColor;
    
    // 根据节点数量动态调整半径
    const baseRadius = Math.max(200, nodes.length * 20);
    
    nodes.forEach((node, index) => {
      if (!node || !node.text) return; // 跳过无效节点
      
      const angle = (2 * Math.PI * index) / nodes.length;
      const radius = baseRadius;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      // 绘制连接线
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 计算节点大小（根据文本长度）
      const textWidth = ctx.measureText(node.text).width;
      const nodeRadius = Math.max(40, Math.min(80, textWidth / 2 + 20));
      
      // 绘制节点
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 绘制文本（自动换行）
      drawWrappedText(ctx, node.text, x, y, nodeRadius * 1.8, '#fff', '14px Arial');

      // 递归绘制子节点
      if (node.children && node.children.length > 0) {
        drawNodes(ctx, node.children, x, y);
      }
    });
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2}>智能思维导图生成器</Title>
      <Paragraph>
        输入主题和内容，AI将自动为您生成结构化的思维导图
      </Paragraph>

      <Row gutter={24}>
        <Col span={12}>
          <Card title="思维导图配置" style={{ marginBottom: '24px' }}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                theme: 'default',
                layout: 'radial',
                nodeColor: '#1890ff',
                lineColor: '#d9d9d9',
                backgroundColor: '#ffffff'
              }}
            >
              <Form.Item
                label="主题标题"
                name="title"
                rules={[{ required: true, message: '请输入主题标题' }]}
              >
                <Input placeholder="例如：人工智能发展历程" />
              </Form.Item>

              <Form.Item
                label="主题描述"
                name="description"
                rules={[{ required: true, message: '请输入主题描述' }]}
              >
                <TextArea 
                  rows={3} 
                  placeholder="详细描述您要创建思维导图的主题内容..."
                />
              </Form.Item>

              <Form.Item
                label="核心内容"
                name="content"
                rules={[{ required: true, message: '请输入核心内容' }]}
              >
                <TextArea 
                  rows={6} 
                  placeholder="输入主要概念、关键词或大纲内容，每行一个要点..."
                />
              </Form.Item>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item label="主题风格" name="theme">
                    <Select options={themeOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="布局方式" name="layout">
                    <Select options={layoutOptions} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="节点颜色" name="nodeColor">
                    <Input type="color" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="线条颜色" name="lineColor">
                    <Input type="color" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="背景颜色" name="backgroundColor">
                    <Input type="color" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    onClick={generateMindMap}
                    loading={loading}
                    icon={<PlusOutlined />}
                  >
                    生成思维导图
                  </Button>
                  <Button 
                    onClick={() => form.resetFields()}
                    icon={<DeleteOutlined />}
                  >
                    重置
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="思维导图预览" style={{ marginBottom: '24px' }}>
            {mindMapData ? (
              <div>
                <canvas
                  ref={canvasRef}
                  style={{ 
                    border: '1px solid #d9d9d9', 
                    borderRadius: '8px',
                    width: '100%',
                    maxWidth: '400px'
                  }}
                />
                <Divider />
                <Space>
                  <Button 
                    type="primary" 
                    onClick={previewMindMap}
                    icon={<EyeOutlined />}
                  >
                    全屏预览
                  </Button>
                  <Button 
                    onClick={downloadMindMap}
                    loading={loading}
                    icon={<DownloadOutlined />}
                  >
                    下载图片
                  </Button>
                </Space>
              </div>
            ) : (
              <div style={{ 
                height: '300px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                border: '2px dashed #d9d9d9',
                borderRadius: '8px',
                color: '#999'
              }}>
                请先生成思维导图
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* 全屏预览模态框 */}
      <Modal
        title="思维导图全屏预览"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
      >
        {mindMapData && (
          <div style={{ textAlign: 'center' }}>
            <canvas
              ref={canvasRef}
              style={{ 
                border: '1px solid #d9d9d9', 
                borderRadius: '8px',
                maxWidth: '100%'
              }}
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MindMapGenerator;
