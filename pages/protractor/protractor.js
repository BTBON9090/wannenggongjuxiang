// pages/protractor/protractor.js
Page({
  data: {
    angle: 0,
    angle_str: '0.0',
    slider_x: 0,
  },
  canvas: null, ctx: null, dpr: 1,
  canvasWidth: 0, canvasHeight: 0,
  center: { x: 0, y: 0 },
  radius1: 0, radius2: 0, radius3: 0,
  sliderTrackWidth: 0, sliderThumbWidth: 0, sliderMaxX: 0,
  lastAngleForVibration: -1,

  onReady() {
    const query = wx.createSelectorQuery();
    query.select('#protractor-canvas').fields({ node: true, size: true }).exec((res) => {
      this.canvas = res[0].node; this.ctx = this.canvas.getContext('2d');
      this.dpr = wx.getSystemInfoSync().pixelRatio;
      this.canvasWidth = res[0].width; this.canvasHeight = res[0].height;
      this.canvas.width = this.canvasWidth * this.dpr; this.canvas.height = this.canvasHeight * this.dpr;
      this.ctx.scale(this.dpr, this.dpr);
      this.center = { x: this.canvasWidth / 2, y: this.canvasHeight - 100 };
      this.radius1 = this.canvasWidth / 2 - 40;
      this.radius2 = this.radius1 + 160; // 110 + 50
      this.radius3 = this.radius2 + 205; // 130 + 75
      this.drawAll();
    });
    const sliderQuery = wx.createSelectorQuery();
    sliderQuery.select('.slider-movable-area').boundingClientRect();
    sliderQuery.select('.slider-thumb').boundingClientRect();
    sliderQuery.exec((res) => {
      if (res[0] && res[1]) {
        this.sliderTrackWidth = res[0].width;
        this.sliderThumbWidth = res[1].width;
        this.sliderMaxX = this.sliderTrackWidth - this.sliderThumbWidth;
      }
    });
  },

  onSliderMove(e) {
    if (e.detail.source === 'touch') {
      const x = e.detail.x;
      let angle = (x / this.sliderMaxX) * 180;
      if (angle > 180) angle = 180; if (angle < 0) angle = 0;
      const currentAngleInt = Math.floor(angle);
      if (currentAngleInt % 5 === 0 && currentAngleInt !== this.lastAngleForVibration) {
        wx.vibrateShort({ type: 'light' });
        this.lastAngleForVibration = currentAngleInt;
      }
      this.setData({ angle: angle, angle_str: angle.toFixed(1) });
      this.drawAll();
    }
  },

  drawAll() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    ctx.beginPath();
    ctx.moveTo(0, this.center.y);
    ctx.lineTo(this.canvasWidth, this.center.y);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2 / this.dpr;
    ctx.stroke();
    const specialLines = [10, 20, 30, 45, 50, 60, 80, 90, 120, 130, 135, 150];
    this.drawDialLayer(this.radius1, 0, 180, 30, '#999', false, 1, specialLines);
    this.drawDialLayer(this.radius2, 60, 120, 10, '#333', false, 1);
    this.drawDialLayer(this.radius3, 70, 110, 5, '#000', true, 0.2);
    this.drawPointer();
  },

  drawDialLayer(radius, startAngle, endAngle, step, color, isFine = false, increment = 1, specialLines = []) {
    const center = this.center, ctx = this.ctx;
    ctx.strokeStyle = color; ctx.fillStyle = color;
    ctx.lineWidth = 1 / this.dpr;
    ctx.beginPath(); ctx.arc(center.x, center.y, radius, Math.PI, 0); ctx.stroke();
    for (let i = startAngle; i <= endAngle; i += increment) {
      const angle = parseFloat(i.toFixed(1));
      const angleRad = angle * Math.PI / 180;
      const x1 = center.x - radius * Math.cos(angleRad), y1 = center.y - radius * Math.sin(angleRad);
      let tickLength = 0;
      if (isFine) {
        if (angle % 1 === 0) tickLength = 10;
        else tickLength = 4;
      } else {
        if (angle % (step / 2) === 0) tickLength = 10;
        else tickLength = 5;
      }
      if (angle % step === 0) tickLength = 15;
      const x2 = center.x - (radius - tickLength) * Math.cos(angleRad), y2 = center.y - (radius - tickLength) * Math.sin(angleRad);
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
      if (angle % step === 0) {
        const numX = center.x - (radius + 18) * Math.cos(angleRad), numY = center.y - (radius + 18) * Math.sin(angleRad);
        ctx.save(); ctx.translate(numX, numY); ctx.rotate(Math.PI / 2 - angleRad); ctx.textAlign = 'center';
        ctx.font = isFine ? '12px Arial' : '10px Arial'; ctx.fillText(angle, 0, 0); ctx.restore();
      }
    }
    specialLines.forEach(angle => {
      if (angle >= startAngle && angle <= endAngle) {
        const angleRad = angle * Math.PI / 180;
        const x1 = center.x - radius * Math.cos(angleRad), y1 = center.y - radius * Math.sin(angleRad);
        ctx.save();
        ctx.strokeStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.beginPath(); ctx.moveTo(center.x, center.y); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.restore();
      }
    });
  },

  drawPointer() {
    const angleRad = (180 - this.data.angle) * Math.PI / 180;
    const x = this.center.x + this.radius3 * 1.1 * Math.cos(angleRad);
    const y = this.center.y - this.radius3 * 1.1 * Math.sin(angleRad);
    this.ctx.beginPath();
    this.ctx.moveTo(this.center.x, this.center.y);
    this.ctx.lineTo(x, y);
    this.ctx.strokeStyle = '#e74c3c';
    this.ctx.lineWidth = 1 / this.dpr;
    this.ctx.stroke();
  }
});