// pages/ruler-setting/ruler-setting.js
const CARD_HEIGHT_MM = 53.98; // 银行卡标准短边高度 mm

Page({
  data: {
    boxHeight: 200,
  },

  touchState: { touching: false, startY: 0, startHeight: 0 },
  maxHeight: 400, // 默认值

  onReady() {
    // 动态计算最大高度
    const query = wx.createSelectorQuery();
    // 注意：选择器改为了新的容器
    query.select('.resizable-box-container').boundingClientRect();
    query.exec((res) => {
      if (res[0]) {
        // 最大高度就是这个容器的高度，再减去一些边距以防万一
        this.maxHeight = res[0].height - 20;
      }
    });
  },

  onLoad() {
    const pixelsPerMm = wx.getStorageSync('pixelsPerMm');
    if (pixelsPerMm) {
      this.setData({ boxHeight: pixelsPerMm * CARD_HEIGHT_MM });
    }
  },

  onTouchStart(e) {
    this.touchState.touching = true;
    this.touchState.startY = e.touches[0].pageY;
    this.touchState.startHeight = this.data.boxHeight;
  },

  onTouchMove(e) {
    if (!this.touchState.touching) return;
    const deltaY = e.touches[0].pageY - this.touchState.startY;
    let newHeight = this.touchState.startHeight + deltaY;

    if (newHeight < 64) newHeight = 64;
    if (newHeight > this.maxHeight) newHeight = this.maxHeight;

    this.setData({ boxHeight: newHeight });
  },

  onSaveCalibration() {
    const pixelsPerMm = this.data.boxHeight / CARD_HEIGHT_MM;
    wx.setStorageSync('pixelsPerMm', pixelsPerMm);
    wx.showToast({ title: '校准成功', icon: 'success' });
    setTimeout(() => { wx.navigateBack(); }, 1000);
  },

  onCancel() {
    wx.navigateBack();
  }
});
