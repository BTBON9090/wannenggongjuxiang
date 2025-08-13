// home.js
Page({
  data: {},

  navigateToTool(event) {
    const url = event.currentTarget.dataset.url;
    if (url) {
      wx.navigateTo({
        url: url
      });
    }
  }
});
