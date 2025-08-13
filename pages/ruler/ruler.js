// pages/ruler/ruler.js
Page({
  onReady() {
    this.drawRuler();
  },

  drawRuler() {
    const sysInfo = wx.getSystemInfoSync();
    const screenWidth = sysInfo.screenWidth;
    const pixelRatio = sysInfo.pixelRatio;

    // 估算每毫米对应的像素值 (1英寸=25.4mm, 微信小程序DPI估算标准为160)
    const pixelsPerMm = (160 * pixelRatio) / 25.4;

    const query = wx.createSelectorQuery();
    query.select('#ruler-canvas')
      .fields({ node: true, size: true })
      .exec((res) => {
        const canvas = res[0].node;
        const ctx = canvas.getContext('2d');

        const dpr = wx.getSystemInfoSync().pixelRatio;
        canvas.width = res[0].width * dpr;
        canvas.height = res[0].height * dpr;
        ctx.scale(dpr, dpr);

        // 开始绘制
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';

        for (let i = 0; i * pixelsPerMm < screenWidth; i++) {
          const x = i * pixelsPerMm;
          let lineHeight = 10; // 默认毫米刻度线长度

          if (i % 10 === 0) { // 厘米刻度
            lineHeight = 20;
            ctx.fillText(i / 10, x, 35);
          } else if (i % 5 === 0) { // 0.5厘米刻度
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
