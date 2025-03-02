const imageUtils = require('../../../utils/image.js');

Page({
  data: {
    expert: null,
    isIntroExpanded: false,
    isExpanded: false,
    services: [
      {
        id: 1,
        name: '图文咨询',
        icon: '/static/images/experts/chat.png',
        desc: '通过图文与律师在线沟通',
        price: 40
      },
      {
        id: 2,
        name: '电话咨询',
        icon: '/static/images/experts/phone.png',
        desc: '高效沟通解决问题，便捷服务',
        price: 40
      },
      {
        id: 3,
        name: '见面咨询',
        icon: '/static/images/experts/meeting.png',
        desc: '当面详谈',
        price: 100
      },
      {
        id: 4,
        name: '代理诉讼案',
        icon: '/static/images/experts/case.png',
        desc: '低费率起诉（待定评估）提供方案，高效',
        price: 80
      },
      {
        id: 5,
        name: '律师函',
        icon: '/static/images/experts/document.png',
        desc: '专业人员办理',
        price: 80
      }
    ]
  },
  imgUrls: null,
  onLoad(options) {
    this.setImagesByPixelRatio();
    if (options.expert) {
      try {
        const expertInfo = JSON.parse(decodeURIComponent(options.expert));
        // 将专家信息的字段拆分为数组
        const fieldArray = expertInfo.fields.split('、');
        this.setData({
          expert: {
            ...expertInfo,
            fieldArray,
            tags: ['资深专家', '平台保证'],
            introduction: `${expertInfo.name}，从业${expertInfo.years}年，专注于${expertInfo.fields}等领域。累计服务咨询人数${expertInfo.consultCount}人，具有丰富的实践经验，具有丰富的实践经验，具有丰富的实践经验，具有丰富的实践经验，具有丰富的实践经验，具有丰富的实践经验，具有丰富的实践经验，具有丰富的实践经验，具有丰富的实践经验，具有丰富的实践经验，具有丰富的实践经验，具有丰富的实践经验，具有丰富的实践经验。`,
          }
        });
      } catch (error) {
        console.error('解析专家信息失败:', error);
        wx.showToast({
          title: '加载专家信息失败',
          icon: 'none'
        });
      }
    }
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtils.getCommonImages('expertsDetail')
    });
  },

  // 切换简介展开/收起状态
  toggleIntro() {
    this.setData({
      isExpanded: !this.data.isExpanded
    });
  },

  // 关注律师
  handleFollow() {
    wx.showToast({
      title: '关注成功',
      icon: 'success'
    });
  },

  // 处理服务项目点击
  handleServiceTap(e) {
    const serviceId = e.currentTarget.dataset.id;
    const service = this.data.services.find(item => item.id === serviceId);
    
    if (service) {
      switch(service.name) {
        case '图文咨询':
          this.handleTextConsult();
          break;
        case '电话咨询':
          this.handlePhoneConsult();
          break;
        case '见面咨询':
          this.handleMeetingConsult();
          break;
        case '代理诉讼案':
          this.handleCaseConsult();
          break;
        case '律师函':
          this.handleLegalLetter();
          break;
      }
    }
  },

  // 图文咨询
  handleTextConsult() {
    const expert = {
      id: this.data.expert.id,
      name: this.data.expert.name,
      avatar: this.data.expert.avatar,
      years: this.data.expert.years,
      consultCount: this.data.expert.consultCount,
      fields: this.data.expert.fields
    };
    
    wx.navigateTo({
      url: '/pages/experts/chat/chat?expert=' + encodeURIComponent(JSON.stringify(expert)),
      fail(err) {
        wx.showToast({
          title: '打开聊天失败',
          icon: 'none'
        });
      }
    });
  },

  // 电话咨询
  handlePhoneConsult() {
    wx.makePhoneCall({
      phoneNumber: '400-000-0000',
      fail(err) {
        wx.showToast({
          title: '拨打电话失败',
          icon: 'none'
        });
      }
    });
  },

  // 见面咨询
  handleMeetingConsult() {
    wx.showModal({
      title: '预约见面咨询',
      content: '是否确认预约见面咨询？',
      success(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/appointment/appointment',
            fail(err) {
              wx.showToast({
                title: '预约失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 代理诉讼
  handleCaseConsult() {
    wx.showModal({
      title: '代理诉讼咨询',
      content: '请详细描述您的案件，我们会尽快联系您',
      success(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/case-form/case-form',
            fail(err) {
              wx.showToast({
                title: '提交失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 律师函
  handleLegalLetter() {
    wx.navigateTo({
      url: '/pages/legal-letter/legal-letter',
      fail(err) {
        wx.showToast({
          title: '打开失败',
          icon: 'none'
        });
      }
    });
  }
}); 