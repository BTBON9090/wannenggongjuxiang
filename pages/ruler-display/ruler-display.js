// pages/ruler-display/ruler-display.js
Page({
  onReady() {
    // 尝试获取校准值，如果没有，则使用默认估算值
    let pixelsPerMm = wx.getStorageSync('pixelsPerMm');
    if (!pixelsPerMm) {
      const sysInfo = wx.getSystemInfoSync();
      const pixelRatio = sysInfo.pixelRatio;
      pixelsPerMm = (160 * pixelRatio) / 25.4;
    }

    this.drawRuler('#ruler-canvas-top', pixelsPerMm);
    this.drawRuler('#ruler-canvas-bottom', pixelsPerMm);
  },

  drawRuler(canvasId, pixelsPerMm) {
    const query = wx.createSelectorQuery();
    query.select(canvasId)
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');
        const dpr = wx.getSystemInfoSync().pixelRatio;
        const canvasWidth = res[0].width;
        canvas.width = canvasWidth * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';

        for (let i = 0; i * pixelsPerMm < canvasWidth; i++) {
          const x = i * pixelsPerMm;
          let lineHeight = 10;
          if (i % 10 === 0) {
            lineHeight = 20;
            ctx.fillText(i / 10, x, 35);
          } else if (i % 5 === 0) {
            lineHeight = 15;
          }
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, lineHeight);
          ctx.stroke();
        }
      });
  }
});
