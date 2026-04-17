/**
 * 博客电子桌宠 - 核心功能脚本
 * 支持拖拽、点击、随机对话等交互
 */

class BlogPet {
  constructor(config = {}) {
    // 合并配置
    this.config = { ...PetConfig, ...config };
    
    this.pet = null;
    this.speech = null;
    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.randomMoveTimer = null;
    this.dialogueTimer = null;
    this.hasMovedDuringDrag = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.speechText = null;
    
    this.init();
  }
  
  init() {
    // 创建桌宠DOM元素
    this.createPetElement();
    // 绑定事件
    this.bindEvents();
    // 启动随机移动
    if (this.config.randomMove) {
      this.startRandomMove();
    }
    // 页面加载完成后显示随机问候
    this.showRandomDialogue();
  }
  
  createPetElement() {
    // 创建容器
    const container = document.createElement('div');
    container.id = 'blog-pet-container';
    container.className = 'blog-pet-container';
    container.style.cssText = `
      position: fixed;
      ${this.config.position}: ${this.config.side}px;
      bottom: ${this.config.bottom}px;
      width: ${this.config.width}px;
      height: ${this.config.height}px;
      z-index: 9999;
      cursor: ${this.config.draggable ? 'grab' : 'pointer'};
      user-select: none;
    `;

    if (this.config.style?.speechTheme) {
      container.dataset.speechTheme = this.config.style.speechTheme;
    }
    if (this.config.style?.floating) {
      container.classList.add('is-floating');
    }
    if (this.config.style?.halo) {
      container.classList.add('has-halo');
    }
    
    // 创建桌宠图片
    this.pet = document.createElement('img');
    this.pet.src = this.config.imagePath;
    this.pet.alt = 'Blog Pet';
    this.pet.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: contain;
      filter: drop-shadow(0 2px 8px rgba(0,0,0,0.15));
      transition: transform 0.3s ease;
    `;
    
    // 创建对话气泡
    this.speech = document.createElement('div');
    this.speech.className = 'blog-pet-speech';
    this.speech.style.cssText = `
      position: absolute;
      left: 50%;
      padding: 8px 12px;
      font-size: 12px;
      pointer-events: none;
      z-index: 10000;
      text-align: center;
      word-break: break-word;
      white-space: normal;
    `;

    this.speechText = document.createElement('span');
    this.speechText.className = 'blog-pet-speech-text';
    
    // 添加气泡小尾巴
    const arrow = document.createElement('div');
    arrow.style.cssText = `
      position: absolute;
      bottom: -8px;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 8px solid;
    `;
    arrow.className = 'blog-pet-speech-arrow';
    this.speech.appendChild(this.speechText);
    this.speech.appendChild(arrow);
    
    // 组合元素
    container.appendChild(this.pet);
    container.appendChild(this.speech);
    document.body.appendChild(container);
  }
  
  bindEvents() {
    if (!this.pet) return;
    
    const container = this.pet.parentElement;
    
    // 鼠标进入 - 显示悬停对话
    container.addEventListener('mouseenter', () => {
      this.showDialogue('hover');
      container.classList.add('is-hover');
      if (this.pet) {
        this.pet.style.transform = 'scale(1.1)';
      }
    });
    
    // 鼠标离开
    container.addEventListener('mouseleave', () => {
      container.classList.remove('is-hover');
      if (this.pet && !this.isDragging) {
        this.pet.style.transform = 'scale(1)';
      }
    });
    
    // 拖拽开始
    if (this.config.draggable) {
      container.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.hasMovedDuringDrag = false;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        container.style.cursor = 'grabbing';
        container.classList.add('is-dragging');
        const rect = container.getBoundingClientRect();
        this.dragOffsetX = e.clientX - rect.left;
        this.dragOffsetY = e.clientY - rect.top;
      });
    }
    
    // 拖拽中
    document.addEventListener('mousemove', (e) => {
      if (!this.isDragging || !this.config.draggable) return;

      if (Math.abs(e.clientX - this.dragStartX) > 4 || Math.abs(e.clientY - this.dragStartY) > 4) {
        this.hasMovedDuringDrag = true;
      }
      
      this.updatePetPosition(
        e.clientX - this.dragOffsetX,
        e.clientY - this.dragOffsetY
      );
    });
    
    // 拖拽结束
    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        container.style.cursor = this.config.draggable ? 'grab' : 'pointer';
        container.classList.remove('is-dragging');
        if (this.pet) {
          this.pet.style.transform = 'scale(1)';
        }
      }
    });
    
    // 点击事件
    container.addEventListener('click', (e) => {
      if (!this.isDragging && !this.hasMovedDuringDrag) {
        this.showDialogue('click');
        this.jumpAnimation();
      }
    });
  }
  
  showDialogue(type = 'random') {
    if (!this.speech) return;
    
    let dialogues = this.config.dialogues;
    
    if (type === 'hover') {
      dialogues = this.config.hoverDialogues;
    } else if (type === 'click') {
      dialogues = this.config.clickDialogues;
    }
    
    const dialogue = dialogues[Math.floor(Math.random() * dialogues.length)];

    // 按对话长度动态设置气泡宽度，让短句更紧凑、长句更自然换行
    const textLength = [...dialogue].length;
    const dynamicWidth = Math.max(92, Math.min(260, 56 + textLength * 10));
    const dynamicMinWidth = textLength <= 4 ? 72 : 88;
    this.speech.style.setProperty('--pet-speech-max-width', `${dynamicWidth}px`);
    this.speech.style.setProperty('--pet-speech-min-width', `${dynamicMinWidth}px`);
    
    if (this.speechText) {
      this.speechText.textContent = dialogue;
    }
    this.speech.classList.add('is-visible');
    
    // 清除之前的计时器
    if (this.dialogueTimer) {
      clearTimeout(this.dialogueTimer);
    }
    
    // 设置自动隐藏
    this.dialogueTimer = setTimeout(() => {
      if (this.speech) {
        this.speech.classList.remove('is-visible');
      }
    }, this.config.dialogueShowTime);
  }
  
  showRandomDialogue() {
    this.showDialogue('random');
  }
  
  jumpAnimation() {
    if (!this.pet) return;
    
    this.pet.style.transition = 'transform 0.3s ease';
    this.pet.style.transform = 'scale(1.1) translateY(-10px)';
    const container = this.pet.parentElement;
    if (container) {
      container.classList.add('is-jumping');
    }
    
    setTimeout(() => {
      if (this.pet) {
        this.pet.style.transform = 'scale(1)';
      }
      if (container) {
        container.classList.remove('is-jumping');
      }
    }, 300);
  }
  
  startRandomMove() {
    if (this.randomMoveTimer) {
      clearInterval(this.randomMoveTimer);
    }
    
    this.randomMoveTimer = setInterval(() => {
      if (!this.isDragging) {
        this.moveRandomly();
      }
    }, this.config.randomMoveInterval);
  }
  
  moveRandomly() {
    const container = document.getElementById('blog-pet-container');
    if (!container) return;
    
    // 计算可移动的范围
    const maxX = window.innerWidth - this.config.width - this.config.side;
    const maxY = window.innerHeight - this.config.height - this.config.bottom - 100;
    
    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;
    
    this.updatePetPosition(randomX, randomY);
  }
  
  updatePetPosition(x, y) {
    const container = document.getElementById('blog-pet-container');
    if (!container) return;

    container.style.transition = this.isDragging
      ? 'none'
      : `left ${this.config.style?.moveDuration || 850}ms cubic-bezier(.2,.8,.2,1), top ${this.config.style?.moveDuration || 850}ms cubic-bezier(.2,.8,.2,1)`;
    
    // 限制在视口内
    const maxX = window.innerWidth - this.config.width;
    const maxY = window.innerHeight - this.config.height;
    
    x = Math.max(0, Math.min(x, maxX));
    y = Math.max(0, Math.min(y, maxY));
    
    container.style.left = x + 'px';
    container.style.bottom = 'auto';
    container.style.top = y + 'px';
    container.style[this.config.position] = 'auto';
  }
  
  destroy() {
    // 清理资源
    if (this.randomMoveTimer) {
      clearInterval(this.randomMoveTimer);
    }
    if (this.dialogueTimer) {
      clearTimeout(this.dialogueTimer);
    }
    
    const container = document.getElementById('blog-pet-container');
    if (container) {
      container.remove();
    }
  }
  
  updateDialogues(newDialogues) {
    this.config.dialogues = newDialogues;
  }
  
  updateHoverDialogues(newDialogues) {
    this.config.hoverDialogues = newDialogues;
  }
  
  updateClickDialogues(newDialogues) {
    this.config.clickDialogues = newDialogues;
  }
}

// 页面加载完成后初始化桌宠
document.addEventListener('DOMContentLoaded', () => {
  if (typeof PetConfig !== 'undefined') {
    window.blogPet = new BlogPet();
  }
});

// 提供全局方法来销毁和重新创建桌宠
window.destroyBlogPet = () => {
  if (window.blogPet) {
    window.blogPet.destroy();
    window.blogPet = null;
  }
};

window.recreateBlogPet = (newConfig = {}) => {
  window.destroyBlogPet();
  window.blogPet = new BlogPet(newConfig);
};
