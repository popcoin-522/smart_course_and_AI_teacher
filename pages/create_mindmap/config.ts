// 思维导图服务配置
export const MINDMAP_CONFIG = {
  // API基础地址
  API_BASE_URL: 'http://localhost:5001',
  
  // API端点
  ENDPOINTS: {
    GENERATE: '/api/mindmap/generate',
    DOWNLOAD: '/api/mindmap/download',
    PREVIEW: '/api/mindmap/preview',
    THEMES: '/api/mindmap/themes',
    LAYOUTS: '/api/mindmap/layouts',
    HEALTH: '/api/mindmap/health'
  },
  
  // 完整API地址
  getApiUrl: (endpoint: string) => `${MINDMAP_CONFIG.API_BASE_URL}${endpoint}`,
  
  // 生成API地址
  getGenerateUrl: () => MINDMAP_CONFIG.getApiUrl(MINDMAP_CONFIG.ENDPOINTS.GENERATE),
  
  // 下载API地址
  getDownloadUrl: () => MINDMAP_CONFIG.getApiUrl(MINDMAP_CONFIG.ENDPOINTS.DOWNLOAD),
  
  // 预览API地址
  getPreviewUrl: () => MINDMAP_CONFIG.getApiUrl(MINDMAP_CONFIG.ENDPOINTS.PREVIEW),
  
  // 主题API地址
  getThemesUrl: () => MINDMAP_CONFIG.getApiUrl(MINDMAP_CONFIG.ENDPOINTS.THEMES),
  
  // 布局API地址
  getLayoutsUrl: () => MINDMAP_CONFIG.getApiUrl(MINDMAP_CONFIG.ENDPOINTS.LAYOUTS),
  
  // 健康检查API地址
  getHealthUrl: () => MINDMAP_CONFIG.getApiUrl(MINDMAP_CONFIG.ENDPOINTS.HEALTH)
};

// 默认配置
export const DEFAULT_CONFIG = {
  // 默认主题
  DEFAULT_THEME: 'default',
  
  // 默认布局
  DEFAULT_LAYOUT: 'radial',
  
  // 默认颜色
  DEFAULT_COLORS: {
    nodeColor: '#1890ff',
    lineColor: '#d9d9d9',
    backgroundColor: '#ffffff'
  },
  
  // 画布尺寸
  CANVAS_SIZE: {
    width: 800,
    height: 600
  }
};
