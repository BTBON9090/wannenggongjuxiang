// pages/compass/compass.js
Page({
  data: {
    direction_text: '正北方',
    longitude: '--',
    latitude: '--',
    altitude: '--',
    animationData: {}
  },

  // --- 新增的变量，用于新的增量算法 ---
  lastReading: 0,       // 上一次的罗盘读数
  cumulativeRotation: 0, // 累积的旋转角度
  // -------------------------------------

  onReady: function () {
    this.startCompass();
  },

  onGetLocationTap() {
    const that = this;
    wx.getLocation({
      type: 'wgs84',
      altitude: true,
      success(res) {
        that.setData({
          longitude: res.longitude.toFixed(2),
          latitude: res.latitude.toFixed(2),
          altitude: res.altitude.toFixed(2)
        });
      },
      fail() {
        wx.showToast({ title: '授权失败，无法获取', icon: 'none' });
        that.setData({ longitude: '获取失败', latitude: '获取失败', altitude: '获取失败' });
      }
    });
  },

  startCompass() {
    const that = this;
    const animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'ease-out',
    });

    wx.startCompass({
      success() {
        wx.onCompassChange(function (res) {
          const newReading = res.direction;

          // --- 全新的增量算法 ---
          // 1. 计算新旧读数的差值
          let diff = newReading - that.lastReading;

          // 2. 处理跨越 0/360度 的情况
          if (diff > 180) { diff -= 360; }
          if (diff < -180) { diff += 360; }

          // 3. 将差值累加到总旋转角度上 (因为我们的指针是反向的，所以用减法)
          that.cumulativeRotation -= diff;
          // 4. 更新上一次的读数
          that.lastReading = newReading;
          // ---------------------

          const direction_text = that.getDirectionText(newReading);
          animation.rotate(that.cumulativeRotation).step();
          that.setData({
            animationData: animation.export(),
            direction_text: direction_text
          });
        });
      },
      fail() {
        wx.showToast({ title: '无法开启罗盘', icon: 'none' });
      }
    });
  },

  onUnload: function () {
    wx.stopCompass();
  },

  getDirectionText(angle) {
    if (angle > 337.5 || angle <= 22.5) return `正北方 ${angle.toFixed(0)}°`;
    if (angle > 22.5 && angle <= 67.5) return `东北方 ${angle.toFixed(0)}°`;
    if (angle > 67.5 && angle <= 112.5) return `正东方 ${angle.toFixed(0)}°`;
    if (angle > 112.5 && angle <= 157.5) return `东南方 ${angle.toFixed(0)}°`;
    if (angle > 157.5 && angle <= 202.5) return `正南方 ${angle.toFixed(0)}°`;
    if (angle > 202.5 && angle <= 247.5) return `西南方 ${angle.toFixed(0)}°`;
    if (angle > 247.5 && angle <= 292.5) return `正西方 ${angle.toFixed(0)}°`;
    if (angle > 292.5 && angle <= 337.5) return `西北方 ${angle.toFixed(0)}°`;
  }
});