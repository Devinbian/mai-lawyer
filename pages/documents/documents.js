// pages/documents/documents.js
const imageUtil = require('../../utils/image.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    documents: [
      {
        id: 1,
        name: '合同协议',
        iconKey: 'contract',
        count: 1240,
        desc: '专业/安全'
      },
      {
        id: 2,
        name: '起诉状',
        iconKey: 'lawsuit',
        count: 86,
        desc: '简洁/高效'
      },
      {
        id: 3,
        name: '答辩状',
        iconKey: 'defense',
        count: 126,
        desc: '简洁/高效'
      },
      {
        id: 4,
        name: '法律意见',
        iconKey: 'legalOpinion',
        count: 2486,
        desc: '简洁/高效'
      },
      {
        id: 5,
        name: '申请文书',
        iconKey: 'application',
        count: 40,
        desc: '个人/单位'
      },
      {
        id: 6,
        name: '通用文书',
        iconKey: 'general',
        count: 2240,
        desc: '广泛/通用'
      }
    ],
    imgUrls: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setImagesByPixelRatio();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },

  // 点击文档类型
  handleDocTap(e) {
    const docId = e.currentTarget.dataset.id;
    const doc = this.data.documents.find(item => item.id === docId);
    if (doc) {
      wx.navigateTo({
        url: `/pages/documents/document-list/document-list?type=${doc.id}&name=${doc.name}`,
        fail(err) {
          wx.showToast({
            title: '打开失败',
            icon: 'none'
          });
        }
      });
    }
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages('documents')
    });
  }
})