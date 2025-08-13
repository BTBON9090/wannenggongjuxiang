// pages/led-display/led-display.js
Page({
  data: {
    speed: 10,
    textList: [],
    textInstanceStyle: '' // 用于存放最终动态生成的style字符串
  },

  onLoad(options) {
    const isLandscape = options.isLandscape === 'true';
    const isColorful = options.isColorful === 'true';

    // --- 动态拼接Style ---
    let style = `font-size: ${options.fontSize}rpx; padding-right: ${options.gap}rpx;`;
    if (isColorful) {
      // 如果是五彩闪烁，则应用闪烁动画，并使用我们新的闪烁速度
      style += ` animation: color-flash ${options.flashSpeed}s linear infinite;`;
    } else {
      // 否则，就使用我们选择的固定颜色
      style += ` color: ${decodeURIComponent(options.textColor)};`;
    }
    // --- End ---

    this.setData({
      speed: options.speed,
      textList: [options.text, options.text],
      textInstanceStyle: style, // 将拼接好的style传给WXML
      // 保存isLandscape用于后续计算
      isLandscape: isLandscape,
      displayText: options.text
    });
  },

  onReady() {
    this.checkAndRepeatText();
  },

  checkAndRepeatText() {
    const that = this;
    const systemInfo = wx.getSystemInfoSync();
    const screenWidth = this.data.isLandscape ? systemInfo.windowHeight : systemInfo.windowWidth;

    const query = wx.createSelectorQuery();
    query.select('.marquee-parent').boundingClientRect();
    query.exec(function (res) {
      if (res[0]) {
        const contentWidth = res[0].width;
        if (contentWidth < screenWidth) {
          const singleTextWidth = contentWidth / 2;
          if (singleTextWidth > 0) {
            const neededCount = Math.ceil(screenWidth / singleTextWidth) + 1;
            const newTextList = [];
            for (let i = 0; i < neededCount; i++) {
              newTextList.push(that.data.displayText);
            }
            that.setData({ textList: newTextList });
          }
        }
      }
    });
  }
});