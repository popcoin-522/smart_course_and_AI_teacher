import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
  Button,
  ColorPicker,
  Divider,
  Drawer,
  Form,
  Input,
  InputNumber,
  Radio,
  Select,
  Slider,
  Space,
  Spin,
  Switch,
  message,
} from 'antd'
import { useForm } from 'antd/es/form/Form.js'
// import { PlayerEvents, SDKEvents } from './lib/enums/events'
// import AvatarPlatform from './lib/core'
import cloneDeep from 'lodash/cloneDeep'
import AvatarPlatform, {
  PlayerEvents,
  SDKEvents,
} from './testSdk/3.1.2.1002/avatar-sdk-web_3.1.2.1002/index.js'

const InitAppInfo = {
  serverUrl: 'wss://avatar.cn-huadong-1.xf-yun.com/v1/interact',
  // serverUrl: 'wss://test.xfyousheng.com/apigateway/avatar_ray/v1/avatar',
  // serverUrl: 'wss://test.xfyousheng.com/apigateway/avatar/v1/avatar',
  // 以下信息为交互平台 创建接口服务 后 服务项目页面获取
  // appId: '',
  // apiKey: '',
  // apiSecret: '',
  // sceneId: '',
  appId: '',
  apiKey: '',
  apiSecret: '',
  sceneId: '',
}
function App() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [loglevel, setLoglevel] = useState(0)
  const [loading, setLoading] = useState(false)
  const [initForm] = useForm()
  const [apiInfoForm] = useForm()
  const [avatarConfigForm] = useForm()
  const [startAvatarForm] = useForm()
  const [textDriverForm] = useForm()
  const [audioDriverForm] = useForm()
  const [actionDriverForm] = useForm()

  const [subtitle, setSubtitle] = useState('')
  const interativeRef = useRef<any>()
  useEffect(() => {
    return () => {
      interativeRef.current?.stop()
    }
  }, [])

  const InitSDK = () => {
    try {
      let interative = interativeRef.current
      if (!interative) {
        interativeRef.current = interative = new (AvatarPlatform as any)({
          ...initForm.getFieldsValue(),
        })

        message.success('初始化成功 可以开启后续实例方法调用')
      } else {
        message.warning('请勿多次初始化 或先销毁当前实例')
      }
    } catch (e: any) {
      console.error(e)
      message.error('初始化失败' + e?.message)
    }
  }
  const bindInteractEvent = () => {
    if (!interativeRef.current) {
      return message.warning('请初始化sdk')
    }
    interativeRef.current.removeAllListeners()
    interativeRef.current
      .on(SDKEvents.connected, (initResp: any) => {
        console.log('sdk event: connected', initResp)
      })
      .on(SDKEvents.stream_start, () => {
        console.log('sdk event: stream_start')
      })
      .on(SDKEvents.disconnected, (e: any) => {
        setLoading(false)
        console.log('sdk event: disconnected')
        if (e) {
          message.error('ws link disconnected')
          console.error(e.code, e.message, e.name, e.stack)
        }
      })
      .on(SDKEvents.asr, (asrData: any) => {
        console.log('sdk event: asr', asrData)
      })
      .on(SDKEvents.nlp, (nlpData: any) => {
        console.log('sdk event: nlp', nlpData)
      })
      .on(SDKEvents.frame_start, (frameData: any) => {
        console.log('sdk event: frameBegin', frameData)
      })
      .on(SDKEvents.frame_stop, (frameData: any) => {
        console.log('sdk event: frameEnd', frameData)
      })
      .on(SDKEvents.action_start, (actionData: any) => {
        console.log('sdk event: actionBegin', actionData)
      })
      .on(SDKEvents.action_stop, (actionData: any) => {
        console.log('sdk event: actionEnd', actionData)
      })
      .on(SDKEvents.tts_duration, (sessionData: any) => {
        console.log('sdk event: duration', sessionData)
      })
      .on(SDKEvents.subtitle_info, (subtitleData: any) => {
        console.log('sdk event: subtitle', subtitleData)
        setSubtitle(subtitleData?.text || '')
      })
      .on(SDKEvents.error, (error: any) => {
        console.log('sdk event: error', error)
      })

    message.success(
      'SDK 交互事件监听绑定成功 可以打开控制台 查看事件日志 [sdk event:]'
    )
  }
  const UnInitSDK = () => {
    interativeRef.current?.destroy()
    interativeRef.current = undefined

    message.success('UnInitSDK成功')
  }
  const getPlayer = () => {
    const player = interativeRef.current.player
    console.log('player', player)
  }
  const createPlayer = () => {
    if (!interativeRef.current) {
      return message.warning('请初始化sdk')
    }
    const player =
      interativeRef.current.player || interativeRef.current.createPlayer()
    console.log('player', player)
    return player
  }
  const bindPlayerEvent = () => {
    if (!interativeRef.current) {
      return message.warning('请初始化sdk')
    }
    const player = interativeRef.current.player
    if (!player) {
      return message.warning('当前不存在player 实例 请调用create 创建')
    }
    player.removeAllListeners()
    player
      .on(PlayerEvents.error /* "error" */, (err: any) => {
        console.log('sdk player event: player error', err)
        if (err?.code === '700005') {
          // 不支持h264
          console.log('sdk player event: player h264 not supported')
        }
      })
      ?.on(PlayerEvents.play, () => {
        console.log('sdk player event: player play')
      })
      .on(PlayerEvents.waiting, () => {
        console.log('sdk player event: player waiting')
      })
      .on(PlayerEvents.playing, () => {
        console.log('sdk player event: player playing')
      })
      .on(PlayerEvents.playNotAllowed, () => {
        console.log(
          'sdk player event: play not allowed, muted play， player call resume after user gusture'
        )
      })

    message.success(
      'SDK Player 事件监听绑定成功 可以打开控制台 查看事件日志 [sdk player event:]'
    )
  }
  const setApiInfo = () => {
    if (!interativeRef.current) {
      return message.warning('请初始化sdk')
    }
    interativeRef.current.setApiInfo({
      ...apiInfoForm.getFieldsValue(),
    })

    message.success('Api 服务信息设置成功 ')
  }
  const setGlobalParams = () => {
    if (!interativeRef.current) {
      return message.warning('请初始化sdk')
    }
    const fcolor = avatarConfigForm.getFieldsValue().subtitle.font_color
    const subtitle_font_color =
      Object.prototype.toString.call(fcolor) === '[object String]'
        ? fcolor
        : fcolor?.toHexString?.()
    const values = cloneDeep(avatarConfigForm.getFieldsValue())

    if (values.avatar.mask_region) {
      values.avatar.mask_region = JSON.parse(values.avatar.mask_region)
    } else {
      delete values.avatar.mask_region
    }
    if (!values.subtitle?.subtitle) {
      delete values.subtitle
    }
    if (!values.background?.enabled) {
      delete values.background
    } else {
      delete values.background.enabled
    }
    if (values.subtitle) {
      values.subtitle.width = values.avatar.width
      values.subtitle.font_color = subtitle_font_color
    }
    interativeRef.current.setGlobalParams({
      ...values,
    })
    message.success('全局 start 信息 设置成功 服务信息设置成功 ')
  }

  const startAvatar = async () => {
    if (!interativeRef.current) {
      return message.warning('请初始化sdk')
    }
    const values = startAvatarForm.getFieldsValue()
    setLoading(true)
    await interativeRef.current
      ?.start({
        wrapper: document.querySelector(
          '.' + values.container
        ) as HTMLDivElement,
        // preRes: {
        //   image: [
        //     {
        //       url: 'https://pygfile.peiyinge.com/business/user/bgimg/1699422531256_ec250b66142fbf375b4899cc416968b3.png',
        //     },
        //     {
        //       url: 'https://pygfile.peiyinge.com/light/user/20240530/31f7e9c5-5e76-4b24-b071-075a8f703327.jpg',
        //     },
        //   ],
        // },
      })
      .then(() => {
        console.warn('player fetch stream ed')
        message.success('连接成功 & 拉流订阅成功 & 流播放成功')
        setLoading(false)
      })
      .catch((e: any) => {
        message.error('连接失败，可以打开控制台查看信息')
        console.error(e.code, e.message, e.name, e.stack)
        setLoading(false)
      })
  }
  const driveAction = async () => {
    const { actionId } = actionDriverForm.getFieldsValue()
    if (!interativeRef.current) {
      return message.warning('请初始化sdk & 连接')
    }
    if (!actionId?.trim()) {
      return message.warning('请输入actionId')
    }
    interativeRef.current.writeCmd('action', actionId?.trim())
  }
  const writeText = async () => {
    const { text, tts, ...extend } = textDriverForm.getFieldsValue()
    if (!interativeRef.current) {
      return message.warning('请初始化sdk & 连接')
    }
    if (!text?.trim()) {
      return message.warning('请输入文本')
    }
    if (tts && !tts?.vcn) {
      delete tts.vcn
    }
    interativeRef.current
      .writeText(text, {
        tts,
        ...extend,
      })
      .then((reqId: string) => {
        message.success(`发送成功request_id: ${reqId}`)
      })
      .catch((err: any) => {
        console.error(err)
        message.error('发送失败，可以打开控制台查看信息')
      })
  }
  const interrupt = async () => {
    if (!interativeRef.current) {
      return message.warning('请初始化sdk & 连接')
    }
    interativeRef.current.interrupt()
  }

  const startRecord = () => {
    if (!interativeRef.current) {
      return message.warning('请初始化sdk & 连接')
    }
    const { nlp, full_duplex, single_seconds } =
      audioDriverForm.getFieldsValue()

    const audio_format = avatarConfigForm.getFieldValue([
      'avatar',
      'audio_format',
    ])
    const destSampleRate: any = {
      1: 16000,
      2: 24000,
    }
    if (interativeRef.current?.recorder) {
      if (nlp && interativeRef.current?.recorder?.sampleRate !== 16000) {
        // 交互拾音只支持16k 16bit
        interativeRef.current.destroyRecorder()
      } else if (
        !nlp &&
        interativeRef.current?.recorder &&
        interativeRef.current?.recorder?.sampleRate !==
          destSampleRate[audio_format]
      ) {
        // 驱动必须与 形象设置的输出声音采样率一致,
        interativeRef.current.destroyRecorder()
      }
    }
    if (!interativeRef.current?.recorder) {
      // 交互播放器必须是16000， 音频驱动 一定要与setGloableParams 全局参数avatar.audio_format
      interativeRef.current?.createRecorder({
        sampleRate: nlp ? 16000 : destSampleRate[audio_format] || 16000,
      })
    }
    const recorder = interativeRef.current?.recorder
    recorder?.startRecord(
      full_duplex ? 0 : single_seconds * 1000,
      () => {
        console.log('recorder auto stopped')
      },
      {
        nlp: nlp,
      }
    )
  }
  const stopRecorder = () => {
    if (!interativeRef.current) {
      return message.warning('请初始化sdk & 连接')
    }
    const recorder = interativeRef.current?.recorder
    recorder?.stopRecord()
  }
  const stopAvatar = async () => {
    if (!interativeRef.current) {
      return message.warning('请初始化sdk')
    }
    interativeRef.current?.stop()
  }
  useEffect(() => {
    return () => {
      interativeRef.current?.destroy()
    }
  }, [])

  return (
    <Spin spinning={loading} tip="Loading...">
      <div className={'wrapper'}>
        <div className="wp wrapper1"></div>
        <div className="wp wrapper2"></div>
        <p className="subtitle">{subtitle}</p>
      </div>
      <Button className="hdl" onClick={() => setDrawerOpen(true)}>
        打开调试面板
      </Button>
      <Drawer
        title="API"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={450}
        maskClosable={false}
      >
        <Space direction="vertical">
          <Button onClick={() => message.success(AvatarPlatform.getVersion())}>
            static getVersion
          </Button>
          <Space>
            <Select
              style={{ width: '100px' }}
              options={[
                { value: 0, label: 'verbose' },
                { value: 1, label: 'debug' },
                { value: 2, label: 'info' },
                { value: 3, label: 'warn' },
                { value: 4, label: 'error' },
                { value: 5, label: 'none' },
              ]}
              value={loglevel}
              onChange={(va) => setLoglevel(va)}
            ></Select>
            <Button
              onClick={() => {
                AvatarPlatform.setLogLevel(loglevel)
                message.success('日志级别设置成功 可以开启控制台查看')
              }}
            >
              static setLogLevel
            </Button>
          </Space>
          <Divider>SDK 初始化参数（初始化前设置）</Divider>
          <Form
            form={initForm}
            initialValues={{
              useInlinePlayer: true,
              binaryData: false,
            }}
          >
            <Form.Item label="使用内敛播放器" name="useInlinePlayer">
              <Switch></Switch>
            </Form.Item>
            {/* <Form.Item label="binary发送" name="binaryData">
              <Switch></Switch>
            </Form.Item> */}
            {/* <Form.Item label="静音续连" name="keepAliveTime">
              <InputNumber min={0} step={1} addonAfter="毫秒"></InputNumber>
            </Form.Item> */}
          </Form>
          <Button onClick={InitSDK} block type="primary">
            初始化SDK
          </Button>
          <Button onClick={bindInteractEvent} block type="primary">
            监听SDK交互事件
          </Button>
          <Divider>播放器</Divider>
          <Space>
            <Button onClick={getPlayer}>获取player实例</Button>
            <Button onClick={createPlayer}>create player实例</Button>
          </Space>
          <Button onClick={bindPlayerEvent} block type="primary">
            监听player事件
          </Button>
          <Divider>SDK 环境参数（start前设置）</Divider>
          <Form
            form={apiInfoForm}
            initialValues={{
              ...InitAppInfo,
            }}
          >
            <Form.Item label="serverUrl" name="serverUrl">
              <Input></Input>
            </Form.Item>
            <Form.Item label="appId" name="appId">
              <Input></Input>
            </Form.Item>
            <Form.Item label="apiKey" name="apiKey">
              <Input></Input>
            </Form.Item>
            <Form.Item label="apiSecret" name="apiSecret">
              <Input></Input>
            </Form.Item>
            <Form.Item label="sceneId" name="sceneId">
              <Input></Input>
            </Form.Item>
          </Form>
          <Button onClick={setApiInfo} block type="primary">
            SDK setApiInfo
          </Button>
          <Divider>SDK startAvatar 参数（startAvatar前设置）</Divider>
          <Form
            form={avatarConfigForm}
            initialValues={{
              avatar_dispatch: { interactive_mode: 0, content_analysis: 0 },
              stream: {
                protocol: 'xrtc',
                alpha: 0,
                bitrate: 1000000,
                fps: 25,
              },
              avatar: {
                avatar_id: '',
                width: 720,
                height: 1280,
                mask_region: '[0, 0, 1080, 1920]',
                scale: 1,
                move_h: 0,
                move_v: 0,
                audio_format: 1,
              },
              tts: {
                vcn: '',
                speed: 50,
                pitch: 50,
                volume: 100,
              },
              subtitle: {
                subtitle: 0,
                font_color: '#ffffff',
              },
              background: {
                enabled: false,
                type: 'url',
                data: '',
              },
            }}
          >
            <Divider>打断模式全局设置</Divider>
            <Form.Item
              label="文本打断模式"
              name={['avatar_dispatch', 'interactive_mode']}
            >
              <Radio.Group>
                <Radio value={1}>打断模式</Radio>
                <Radio value={0}>追加模式</Radio>
              </Radio.Group>
            </Form.Item>
            <Divider>推流信息</Divider>
            <Form.Item label="推流格式" name={['stream', 'protocol']}>
              <Select
                style={{ width: '100px' }}
                options={[
                  { value: 'webrtc', label: 'webrtc' },
                  { value: 'xrtc', label: 'xrtc' },
                  { value: 'rtmp', label: 'rtmp 不支持播放' },
                ]}
              ></Select>
            </Form.Item>
            <Form.Item label="透明通道(xrtc)" name={['stream', 'alpha']}>
              <Radio.Group>
                <Radio value={1}>开启</Radio>
                <Radio value={0}>关闭</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="码率" name={['stream', 'bitrate']}>
              <InputNumber min={500000} max={5000000} step={1}></InputNumber>
            </Form.Item>
            <Form.Item label="fps" name={['stream', 'fps']}>
              <Slider
                min={15}
                max={25}
                step={1}
                marks={{ 15: '15', 20: '20', 25: '25' }}
              ></Slider>
            </Form.Item>
            <Divider>形象信息</Divider>
            <Form.Item label="形象ID" name={['avatar', 'avatar_id']}>
              <Input></Input>
            </Form.Item>

            <Form.Item
              label="情感分析"
              name={['avatar_dispatch', 'content_analysis']}
              extra="该参数仅超拟人非语音驱动时支持，常规请关闭"
            >
              <Radio.Group>
                <Radio value={1}>开启</Radio>
                <Radio value={0}>关闭</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="流宽" name={['avatar', 'width']}>
              <InputNumber></InputNumber>
            </Form.Item>
            <Form.Item label="流高" name={['avatar', 'height']}>
              <InputNumber></InputNumber>
            </Form.Item>
            <Form.Item label="mask_region" name={['avatar', 'mask_region']}>
              <Input></Input>
            </Form.Item>
            <Form.Item label="scale" name={['avatar', 'scale']}>
              <InputNumber min={0.1} max={1}></InputNumber>
            </Form.Item>
            <Form.Item label="move_h" name={['avatar', 'move_h']}>
              <InputNumber></InputNumber>
            </Form.Item>
            <Form.Item label="move_v" name={['avatar', 'move_v']}>
              <InputNumber></InputNumber>
            </Form.Item>
            <Form.Item
              label="音频驱动/音频输出采样率"
              name={['avatar', 'audio_format']}
            >
              <Radio.Group>
                <Radio value={1}>16k</Radio>
                <Radio value={2}>24k</Radio>
              </Radio.Group>
            </Form.Item>

            <Divider>形象信息</Divider>
            <Form.Item label="声音" name={['tts', 'vcn']}>
              <Input></Input>
            </Form.Item>
            <Form.Item label="语速" name={['tts', 'speed']}>
              <Slider min={1} max={100}></Slider>
            </Form.Item>
            <Form.Item label="语调" name={['tts', 'pitch']}>
              <Slider min={1} max={100}></Slider>
            </Form.Item>
            <Form.Item label="音量" name={['tts', 'volume']}>
              <Slider min={1} max={100}></Slider>
            </Form.Item>
            <Divider>字幕信息</Divider>
            <Form.Item
              label="字幕"
              name={['subtitle', 'subtitle']}
              extra="不启用 sdk 内部默认未启用"
            >
              <Select
                options={[
                  { value: 0, label: '关闭' },
                  { value: 1, label: '服务端字幕' },
                  // { value: 2, label: '响应字幕' },
                ]}
              ></Select>
            </Form.Item>
            <Form.Item label="字体颜色" name={['subtitle', 'font_color']}>
              <ColorPicker disabledAlpha format="hex"></ColorPicker>
            </Form.Item>
            <Divider>背景</Divider>
            <Form.Item
              label="背景"
              name={['background', 'enabled']}
              extra="不启用（默认原始训练）"
            >
              <Switch></Switch>
            </Form.Item>
            <Form.Item label="数据类型" name={['background', 'type']}>
              <Radio.Group>
                <Radio value={'url'}>url</Radio>
                <Radio value={'res_id'}>resId</Radio>
                <Radio value={'data'}>base64</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="图片数据" name={['background', 'data']}>
              <Input></Input>
            </Form.Item>
            {/* <Divider>全局上行音频配置</Divider> */}
            {/* <Form.Item
              label="采样率"
              name={['audio', 'sample_rate']}
              extra="sdk 内部默认 16000"
            >
              <Radio.Group>
                <Radio value={16000}>16000</Radio>
                <Radio value={24000}>24000</Radio>
              </Radio.Group>
            </Form.Item> */}
          </Form>
          <Button onClick={setGlobalParams} block type="primary">
            SDK setGlobalParams
          </Button>
          <Form
            form={startAvatarForm}
            initialValues={{
              container: 'wrapper1',
            }}
          >
            <Form.Item label="选择渲染区域dom" name="container">
              <Radio.Group>
                <Radio value={'wrapper1'}>左侧容器</Radio>
                <Radio value={'wrapper2'}>右侧容器</Radio>
              </Radio.Group>
            </Form.Item>
          </Form>
          <Button onClick={startAvatar} block type="primary">
            SDK start
          </Button>
          <Divider>交互 / 虚拟人驱动</Divider>
          <Form
            form={textDriverForm}
            initialValues={{
              avatar_dispatch: {
                interactive_mode: 0,
                content_analysis: 0,
              },
              text: '你好[[action=A_W_walk_left_O]]',
              tts: {
                vcn: '',
                speed: 50,
                pitch: 50,
                volume: 100,
              },
              nlp: false,
            }}
          >
            <Form.Item label="文本是否理解" name="nlp">
              <Switch></Switch>
            </Form.Item>
            <Form.Item
              label="文本打断模式"
              name={['avatar_dispatch', 'interactive_mode']}
            >
              <Radio.Group>
                <Radio value={1}>打断模式</Radio>
                <Radio value={0}>追加模式</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item
              label="情感分析"
              name={['avatar_dispatch', 'content_analysis']}
              extra="该参数仅超拟人非语音驱动时支持，常规请关闭"
            >
              <Radio.Group>
                <Radio value={1}>开启</Radio>
                <Radio value={0}>关闭</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item label="文本" name="text">
              <Input.TextArea></Input.TextArea>
            </Form.Item>
            <Form.Item label="声音" name={['tts', 'vcn']}>
              <Input></Input>
            </Form.Item>
            <Form.Item label="语速" name={['tts', 'speed']}>
              <Slider min={1} max={100}></Slider>
            </Form.Item>
            <Form.Item label="语调" name={['tts', 'pitch']}>
              <Slider min={1} max={100}></Slider>
            </Form.Item>
            <Form.Item label="音量" name={['tts', 'volume']}>
              <Slider min={1} max={100}></Slider>
            </Form.Item>
          </Form>
          <Button onClick={writeText} type="primary">
            文本驱动/交互 writeText
          </Button>
          <Divider>立即驱动指定动作</Divider>
          <Form
            form={actionDriverForm}
            initialValues={{
              actionId: '',
            }}
          >
            <Form.Item label="动作ID" name="actionId">
              <Input></Input>
            </Form.Item>
          </Form>
          <Button block onClick={driveAction} type="primary">
            立即执行动作 API driveAction
          </Button>

          <Divider>全局打断当前播报</Divider>
          <Button block onClick={interrupt} type="primary">
            发送打断 SDK API interrupt
          </Button>
          <Divider>语音交互 / 语音驱动</Divider>
          <Form
            form={audioDriverForm}
            initialValues={{
              full_duplex: 0,
              nlp: false,
              single_seconds: 20,
            }}
          >
            <Form.Item label="是否理解" name="nlp">
              <Switch></Switch>
            </Form.Item>
            <Form.Item label="语音模式" name="full_duplex">
              <Radio.Group>
                <Radio value={1}>全双工</Radio>
                <Radio value={0}>单轮</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="单轮模式端语音自动停止时间"
              name="single_seconds"
              extra="单轮模式 该时间内 用户未主动停止录音，则自动停止；sdk startRecord 支持设置时间"
            >
              <Slider min={5} max={30}></Slider>
            </Form.Item>
          </Form>
          <Button onClick={startRecord} type="primary">
            开始录音 SDK API startRecord
          </Button>
          <Button onClick={stopRecorder} type="primary">
            结束录音 SDK API stopRecord
          </Button>
          <Divider>播放器方法--前端</Divider>
          <Button
            onClick={() => {
              interativeRef.current?.player?.resume()
            }}
            type="primary"
          >
            恢复播放 SDK player API resume
          </Button>
          <p>
            由于浏览器限制，无法自动播放时，需要引导用户手动点击 并 调用 resume
            恢复播放
          </p>
          <Button
            onClick={() => {
              interativeRef.current?.player?.resize()
            }}
          >
            手动刷新渲染 SDK player API resize
          </Button>
          <Button
            onClick={() => {
              if (interativeRef.current?.player)
                interativeRef.current.player.muted = true
            }}
            type="primary"
          >
            静音 SDK player player.muted = true
          </Button>
          <Button
            onClick={() => {
              if (interativeRef.current?.player)
                interativeRef.current.player.muted = false
            }}
            type="primary"
          >
            解除静音 SDK player.muted = false
          </Button>
          <div>
            设置播放外放音量：
            <Slider
              min={0}
              max={100}
              defaultValue={100}
              onChange={(v: number) => {
                if (interativeRef.current?.player)
                  interativeRef.current.player.volume = v / 100
              }}
            ></Slider>
          </div>
          <Divider>断开链接</Divider>
          <Button onClick={stopAvatar} block type="primary">
            SDK API stop
          </Button>
          <Divider>逆初始化 销毁SDK实例</Divider>
          <Button onClick={UnInitSDK} block type="primary">
            SDK API destroy
          </Button>
        </Space>
      </Drawer>
      <div className={'panel'}>
        {/* <div
          onClick={() => {
            console.log(UserMedia.getEnumerateDevices('audiooutput'))
          }}
        >
          get output Devices
        </div>
        <div
          onClick={() => {
            console.log(UserMedia.getEnumerateDevices('audioinput'))
          }}
        >
          get input Devices
        </div>
        <div
          onClick={async () => {
            const outputs = await UserMedia.getEnumerateDevices('audiooutput')
            const output = outputs[Math.floor(Math.random() * outputs.length)]
            console.log(output)
            if (interativeRef.current?.player)
              interativeRef.current.player.setSinkId(output.deviceId)
          }}
        >
          switch Devices
        </div> */}

        {/* <div
          onClick={async () => {
            const inputs = await UserMedia.getEnumerateDevices('audioinput')
            const input = inputs[Math.floor(Math.random() * inputs.length)]
            console.log(input)
            if (interativeRef.current?.player)
              interativeRef.current.recorder?.switchDevice(input.deviceId)
          }}
        >
          switch recorder Devices
        </div> */}
      </div>
    </Spin>
  )
}

export default App
