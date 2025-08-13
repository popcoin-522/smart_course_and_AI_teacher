import React, { useState } from 'react';
import {
  Button,
  Form,
  Input,
  Select,
  message,
  Card,
  Space,
  Divider,
  Typography,
  Upload,
  Modal,
} from 'antd';
import { UploadOutlined, DownloadOutlined, FileTextOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Title, Paragraph } = Typography;
const { Option } = Select;

interface PPTFormData {
  title: string;
  content: {
    sections: Array<{
      title: string;
      description: string;
    }>;
  };
  author: string;
  date: string;
  template: string;
}

interface PPTGeneratorProps {
  endpoint?: string;
  onGenerate?: (data: PPTFormData) => void;
}

const PPTGenerator: React.FC<PPTGeneratorProps> = ({ 
  endpoint = 'http://localhost:5000/api/generate-ppt',
  onGenerate 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [generatedPPT, setGeneratedPPT] = useState<{
    filename: string;
    download_url: string;
  } | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);

  const templates = [
    { value: 'lecture.md.jinja', label: '讲座模板' },
    { value: 'simple.md.jinja', label: '简单模板' },
  ];

  const handleGenerate = async (values: any) => {
    setLoading(true);
    try {
      // 构建请求数据
      const requestData = {
        title: values.title,
        content: {
          sections: values.sections || []
        },
        author: values.author || '智课云师',
        date: values.date || new Date().toLocaleDateString('zh-CN'),
        template: values.template || 'lecture.md.jinja'
      };

      // 调用后端API
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success === true) {
        // 构建完整的下载URL
        const baseUrl = endpoint.replace('/api/generate-ppt', '');
        const downloadUrl = `${baseUrl}${result.download_url}`;
        
        setGeneratedPPT({
          filename: result.filename,
          download_url: downloadUrl
        });
        message.success('PPT生成成功！');
        
        // 调用父组件的回调
        if (onGenerate) {
          onGenerate(requestData);
        }
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (error: any) {
      console.error('PPT生成错误:', error);
      message.error(`生成失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedPPT) return;
    
    try {
      const response = await fetch(generatedPPT.download_url);
      if (!response.ok) {
        throw new Error('下载失败');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = generatedPPT.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      message.success('下载开始');
    } catch (error: any) {
      message.error(`下载失败: ${error.message}`);
    }
  };

  const addSection = () => {
    const sections = form.getFieldValue('sections') || [];
    form.setFieldValue('sections', [
      ...sections,
      { title: '', description: '' }
    ]);
  };

  const removeSection = (index: number) => {
    const sections = form.getFieldValue('sections') || [];
    const newSections = sections.filter((_: any, i: number) => i !== index);
    form.setFieldValue('sections', newSections);
  };

  return (
    <Card title="PPT生成器" style={{ margin: '16px 0' }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleGenerate}
        initialValues={{
          template: 'lecture.md.jinja',
          author: '智课云师',
          date: new Date().toLocaleDateString('zh-CN'),
          sections: [{ title: '', description: '' }]
        }}
      >
        <Form.Item
          label="PPT标题"
          name="title"
          rules={[{ required: true, message: '请输入PPT标题' }]}
        >
          <Input placeholder="请输入PPT标题" />
        </Form.Item>

        <Form.Item
          label="模板选择"
          name="template"
        >
          <Select>
            {templates.map(template => (
              <Option key={template.value} value={template.value}>
                {template.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="作者" name="author">
          <Input placeholder="作者姓名" />
        </Form.Item>

        <Form.Item label="日期" name="date">
          <Input placeholder="日期" />
        </Form.Item>

        <Form.Item label="内容章节">
          <Form.List name="sections">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'title']}
                      rules={[{ required: true, message: '请输入章节标题' }]}
                    >
                      <Input placeholder="章节标题" style={{ width: 200 }} />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, 'description']}
                      rules={[{ required: true, message: '请输入章节描述' }]}
                    >
                      <TextArea 
                        placeholder="章节描述" 
                        rows={2} 
                        style={{ width: 300 }}
                      />
                    </Form.Item>
                    <Button 
                      type="text" 
                      danger 
                      onClick={() => remove(name)}
                      disabled={fields.length === 1}
                    >
                      删除
                    </Button>
                  </Space>
                ))}
                <Form.Item>
                  <Button 
                    type="dashed" 
                    onClick={() => add()} 
                    block 
                    icon={<UploadOutlined />}
                  >
                    添加章节
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>

        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<FileTextOutlined />}
            >
              生成PPT
            </Button>
            <Button onClick={() => form.resetFields()}>
              重置表单
            </Button>
          </Space>
        </Form.Item>
      </Form>

      {generatedPPT && (
        <Card 
          title="生成结果" 
          style={{ marginTop: 16 }}
          extra={
            <Space>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={handleDownload}
              >
                下载PPT
              </Button>
              <Button onClick={() => setPreviewVisible(true)}>
                预览信息
              </Button>
            </Space>
          }
        >
          <Paragraph>
            <strong>文件名:</strong> {generatedPPT.filename}
          </Paragraph>
          <Paragraph>
            <strong>状态:</strong> 生成成功
          </Paragraph>
        </Card>
      )}

      <Modal
        title="PPT生成信息"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <div>
          <p><strong>标题:</strong> {form.getFieldValue('title')}</p>
          <p><strong>作者:</strong> {form.getFieldValue('author')}</p>
          <p><strong>日期:</strong> {form.getFieldValue('date')}</p>
          <p><strong>模板:</strong> {form.getFieldValue('template')}</p>
          <p><strong>章节数:</strong> {(form.getFieldValue('sections') || []).length}</p>
        </div>
      </Modal>
    </Card>
  );
};

export default PPTGenerator; 