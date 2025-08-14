// pages/ruler/ruler.js
Page({
  data: {
    pixelsPerMm: 0,
    pointer_y: 100,
    activeUnit: 'cm',
    measurement: { cm_str: '0.00', mm_str: '0.0', shicun_str: '0.00', inch_str: '0.00' }
  },

  // rpx转换px的比例
  rpxToPx: wx.getSystemInfoSync().screenWidth / 750,
  // 指针UI的偏移量
  pointerOffsetPx: (60 / 2) * (wx.getSystemInfoSync().screenWidth / 750),
  // 用于震动反馈的上一次毫米读数
  lastMmForVibration: -1,

  onShow() {
    this.getPixelRatioAndDraw();
    this.calculateMeasurement(this.data.pointer_y + this.pointerOffsetPx, true);
  },

  getPixelRatioAndDraw() {
    let pixelsPerMm = wx.getStorageSync('pixelsPerMm');
    if (!pixelsPerMm) {
      const sysInfo = wx.getSystemInfoSync();
      pixelsPerMm = (160 * sysInfo.pixelRatio) / 25.4;
    }
    this.setData({ pixelsPerMm });
    this.drawRuler();
  },

  drawRuler() {
    const query = wx.createSelectorQuery();
    query.select('#ruler-canvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0] || !res[0].node) return;
      const canvas = res[0].node, ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio, canvasHeight = res[0].height;
      canvas.width = res[0].width * dpr; canvas.height = canvasHeight * dpr;
      ctx.scale(dpr, dpr); ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.font = '10px Arial'; ctx.textBaseline = 'middle';
      const unit = this.data.activeUnit, pixelsPerMm = this.data.pixelsPerMm;
      if (unit === 'cm') {
        for (let i = 0; i * pixelsPerMm < canvasHeight; i++) {
          const y = i * pixelsPerMm; let h = 15;
          if (i % 10 === 0) { h = 30; ctx.fillText(i / 10, 40, y); } else if (i % 5 === 0) { h = 22; }
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(h, y); ctx.stroke();
        }
      } else if (unit === 'shicun') {
        const pxPerCun = pixelsPerMm * (100 / 3);
        for (let i = 0; i * pxPerCun / 10 < canvasHeight; i++) {
          const y = i * pxPerCun / 10; let h = 15;
          if (i % 10 === 0) { h = 30; ctx.fillText(i / 10, 40, y); } else if (i % 5 === 0) { h = 22; }
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(h, y); ctx.stroke();
        }
      } else if (unit === 'inch') {
        const pxPerInch = pixelsPerMm * 25.4;
        for (let i = 0; i * pxPerInch / 16 < canvasHeight; i++) {
          const y = i * pxPerInch / 16; let h = 12;
          if (i % 16 === 0) { h = 30; ctx.fillText(i / 16, 40, y); } else if (i % 8 === 0) { h = 25; } else if (i % 4 === 0) { h = 20; } else if (i % 2 === 0) { h = 16; }
          ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(h, y); ctx.stroke();
        }
      }
    });
  },

  onPointerMove(e) {
    const actual_line_y = e.detail.y + this.pointerOffsetPx;
    this.calculateMeasurement(actual_line_y);
  },

  calculateMeasurement(y_px, isInitial = false) {
    if (this.data.pixelsPerMm > 0) {
      const mm = y_px / this.data.pixelsPerMm;
      const currentMmInt = Math.floor(mm);
      // 如果毫米整数变化了，并且不是第一次加载，就震动
      if (currentMmInt !== this.lastMmForVibration && !isInitial) {
        wx.vibrateShort({ type: 'light' });
      }
      this.lastMmForVibration = currentMmInt;

      const cm = mm / 10, shicun = mm / (100 / 3), inch = mm / 25.4;
      this.setData({
        measurement: { cm_str: cm.toFixed(2), mm_str: mm.toFixed(1), shicun_str: shicun.toFixed(2), inch_str: inch.toFixed(2) }
      });
    }
  },

  onUnitSwitch(e) {
    this.setData({ activeUnit: e.currentTarget.dataset.unit });
    this.drawRuler();
  },

  onCalibrateTap() {
    wx.navigateTo({ url: '/pages/ruler-setting/ruler-setting' });
  }
});
