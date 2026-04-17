/**
 * 电子桌宠配置文件
 * 你可以在这里自定义对话内容和其他参数
 */

const PetConfig = {
  // 桌宠图片路径
  imagePath: '/img/frog_aggressive.png',
  
  // 桌宠宽度和高度（像素）
  width: 120,
  height: 120,
  
  // 桌宠位置：'left' | 'right'
  position: 'left',
  
  // 距离底部的距离（像素）
  bottom: 20,
  
  // 距离边界的距离（像素）
  side: 20,
  
  // 随机对话语录 - 修改这里来自定义你的桌宠对话
  dialogues: [
    '嘿，你好呀！',
    '今天天气真好，不是吗？',
    '我在这里陪你哦～',
    '来摸会儿鱼吧',
    '你在看什么呢？',
    '世界那么大，我想去看看',
    '我们一起去旅行吧',
    '呱呱呱~',
  ],
  
  // 鼠标悬停时的对话
  hoverDialogues: [
    '你点我干啥？',
    '干嘛呢？',
    '你想干什么？',
    '别摸蛙了',
  ],
  
  // 点击时的对话
  clickDialogues: [
    '哎呀，别戳我！',
    '我投降了！',
    '不好好学习！',
    '你又点我了！',
    '有这么无聊吗？',
  ],
  
  // 对话显示时长（毫秒）
  dialogueShowTime: 3000,
  
  // 是否启用拖拽功能
  draggable: true,
  
  // 是否启用随机移动
  randomMove: true,
  
  // 随机移动的间隔时间（毫秒）
  randomMoveInterval: 60000,

  // 视觉效果配置
  style: {
    // 对话气泡主题：dark | light | frog
    speechTheme: 'frog',
    // 是否启用悬浮呼吸动画
    floating: true,
    // 是否启用发光光晕
    halo: true,
    // 随机移动动画时长（毫秒）
    moveDuration: 850,
  },
};
