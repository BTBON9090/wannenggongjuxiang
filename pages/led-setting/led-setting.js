// pages/led-setting/led-setting.js
Page({
  data: {
    textToShow: '哆啦A梦的裤兜',
    fontSize: 480,
    speed: 3,
    gap: 200,
    flashSpeed: 3, // 新增：闪烁速度
    isLandscape: false,
    isColorful: false,
    textColor: '#FFFFFF',
    colorOptions: [
      { value: '#FFFFFF' }, { value: '#FF0000' }, { value: '#FFFF00' },
      { value: '#00FF00' }, { value: '#00FFFF' }, { value: '#0000FF' },
    ]
  },

  onTextInput(event) {
    this.setData({ textToShow: event.detail.value });
  },

  onSliderChange(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [field]: event.detail.value });
  },

  onSwitchChange(event) {
    const field = event.currentTarget.dataset.field;
    this.setData({ [field]: event.detail.value });
  },

  onColorSelect(event) {
    const color = event.currentTarget.dataset.color;
    this.setData({ textColor: color });
  },

  onGenerate() {
    if (!this.data.textToShow) {
      wx.showToast({ title: '请输入文字', icon: 'none' });
      return;
    }

    const params = `text=${this.data.textToShow}` +
                 `&fontSize=${this.data.fontSize}` +
                 `&speed=${this.data.speed}` +
                 `&gap=${this.data.gap}` +
                 `&isLandscape=${this.data.isLandscape}` +
                 `&isColorful=${this.data.isColorful}` +
                 `&textColor=${encodeURIComponent(this.data.textColor)}` + // 对颜色值编码
                 `&flashSpeed=${this.data.flashSpeed}`;

    wx.navigateTo({
      url: '/pages/led-display/led-display?' + params
    });
  }
})