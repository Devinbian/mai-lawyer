const imageUtil = require('../../../utils/image.js');

Page({
  data: {
    searchKeyword: '',
    documents: [
      {
        id: '29010',
        title: '西安市住房租赁合同示范文本(住房租赁企业版)(西安市2023版)',
        description: '出租人与承租人签订住房租赁合同，双方约定房屋状况、租金租赁期限及其他等事宜。出租人与承租人签订住房...',
        number: '29010',
        words: '7017',
        date: '2025-01-01',
        price: 7,
        type: 'word'
      },
      {
        id: '25355',
        title: '北京市住房租赁合同（北京市2023版）',
        description: '出租人向承租人出租房屋并收取租金。',
        number: '25355',
        words: '7017',
        date: '2025-01-01',
        price: 7,
        type: 'word'
      },
      {
        id: '42462',
        title: '南京市房屋租赁合同（试行）（自行交易版）(南京市2019版)',
        description: '出租人应当就合同重大事项对承租人尽到提示义务承租人应当审慎签订本合同，在签订本该合同款。',
        number: '42462',
        words: '7017',
        date: '2025-01-01',
        price: 0,
        type: 'word'
      },
      {
        id: '42463',
        title: '上海市住房租赁合同（2023年版）',
        description: '适用于上海市房屋租赁，包含租赁期限、租金支付、物业费用、维修责任等详细条款。',
        number: '42463',
        words: '6500',
        date: '2025-01-01',
        price: 8,
        type: 'word'
      },
      {
        id: '42464',
        title: '广州市房屋租赁合同标准文本（2023版）',
        description: '广州市住房和城乡建设局制定，适用于广州市行政区域内的房屋租赁活动。',
        number: '42464',
        words: '5800',
        date: '2025-01-01',
        price: 6,
        type: 'word'
      },
      {
        id: '42465',
        title: '深圳市房屋租赁合同（住宅类）（2023版）',
        description: '深圳市房屋租赁示范文本，包含租赁用途、租金支付方式、押金约定等内容。',
        number: '42465',
        words: '6200',
        date: '2025-01-01',
        price: 0,
        type: 'excel'
      },
      {
        id: '42466',
        title: '杭州市住房租赁合同（2023版）',
        description: '适用于杭州市住房租赁市场，明确规定租赁双方权利义务，保障租赁关系稳定。',
        number: '42466',
        words: '5500',
        date: '2025-01-01',
        price: 7,
        type: 'word'
      },
      {
        id: '42467',
        title: '成都市房屋租赁合同（2023年修订）',
        description: '成都市住建局发布，规范房屋租赁行为，维护租赁双方合法权益。',
        number: '42467',
        words: '6800',
        date: '2025-01-01',
        price: 0,
        type: 'pdf'
      },
      {
        id: '42468',
        title: '武汉市住房租赁合同（标准版）（2023版）',
        description: '武汉市房屋租赁示范文本，包含房屋交付、使用要求、维修责任等条款。',
        number: '42468',
        words: '5900',
        date: '2025-01-01',
        price: 6,
        type: 'word'
      },
      {
        id: '42469',
        title: '重庆市房屋租赁合同（2023版）',
        description: '重庆市住建委发布，适用于重庆市房屋租赁，规范租赁行为。',
        number: '42469',
        words: '6100',
        date: '2025-01-01',
        price: 7,
        type: 'excel'
      },
      {
        id: '42470',
        title: '天津市住房租赁合同（2023版）',
        description: '天津市房屋租赁合同示范文本，明确规定租赁期限、租金支付等事项。',
        number: '42470',
        words: '5700',
        date: '2025-01-01',
        price: 6,
        type: 'word'
      },
      {
        id: '42471',
        title: '苏州市房屋租赁合同（2023版）',
        description: '苏州市住建局制定，适用于苏州市房屋租赁，保护租赁双方权益。',
        number: '42471',
        words: '6300',
        date: '2025-01-01',
        price: 0,
        type: 'pdf'
      },
      {
        id: '42472',
        title: '长沙市住房租赁合同（2023版）',
        description: '长沙市房屋租赁示范文本，规范租赁行为，维护市场秩序。',
        number: '42472',
        words: '5800',
        date: '2025-01-01',
        price: 7,
        type: 'word'
      }
    ],
    filteredDocuments: [],
    pageSize: 10,
    currentPage: 1,
    isLoading: false,
    hasMore: true,
    isRefreshing: false,
    imgUrls: null,
    canRefresh: true,
    scrollTop: 0
  },

  onLoad() {
    wx.showToast({
      title: "加载中...",
      icon: "loading",
      duration: 2000,
    });

    this.setImagesByPixelRatio();
    this.loadInitialData();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages('documentList')
    });
  },

  // 加载初始数据
  loadInitialData() {
    const { pageSize, documents } = this.data;
    const initialData = documents.slice(0, pageSize);

    setTimeout(() => {
      this.setData({
        filteredDocuments: initialData,
        hasMore: documents.length > pageSize,
        currentPage: 1,
        isLoading: false,
        isRefreshing: false,
      }, () => {
        wx.hideToast();
      });
    }, 1000);
  },

  // 监听滚动事件
  onScroll(e) {
    const scrollTop = e.detail.scrollTop;
    this.setData({
      scrollTop,
      canRefresh: scrollTop <= 0
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.canRefresh) {
      wx.stopPullDownRefresh();
      return;
    }

    this.setData({
      isRefreshing: true,
      currentPage: 1
    });

    // 模拟刷新延迟
    setTimeout(() => {
      this.loadInitialData();
      this.setData({
        isRefreshing: false
      });
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 滚动到底部
  onReachBottom() {
    if (this.data.isLoading || !this.data.hasMore) return;
    
    this.setData({
      isLoading: true
    });

    // 模拟加载更多
    setTimeout(() => {
      const { currentPage, pageSize, documents, searchKeyword } = this.data;
      const nextPage = currentPage + 1;
      const start = (nextPage - 1) * pageSize;
      const end = start + pageSize;

      let newData;
      if (searchKeyword) {
        // 如果有搜索关键词，从过滤后的结果中加载
        const filteredAll = this.filterDocumentsList(searchKeyword);
        newData = [
          ...this.data.filteredDocuments,
          ...filteredAll.slice(start, end)
        ];
        this.setData({
          hasMore: end < filteredAll.length
        });
      } else {
        // 没有搜索关键词，从完整列表加载
        newData = [
          ...this.data.filteredDocuments,
          ...documents.slice(start, end)
        ];
        this.setData({
          hasMore: end < documents.length
        });
      }

      this.setData({
        filteredDocuments: newData,
        currentPage: nextPage,
        isLoading: false
      });
    }, 1000);
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value;
    this.setData({
      searchKeyword: keyword,
      currentPage: 1
    });
    
    if (!keyword) {
      this.loadInitialData();
      return;
    }

    const filtered = this.filterDocumentsList(keyword);
    const initialFiltered = filtered.slice(0, this.data.pageSize);

    this.setData({
      filteredDocuments: initialFiltered,
      hasMore: filtered.length > this.data.pageSize
    });
  },

  // 搜索确认
  onSearch() {
    this.onSearchInput({ detail: { value: this.data.searchKeyword } });
  },

  // 过滤文档列表
  filterDocumentsList(keyword) {
    return this.data.documents.filter(doc => {
      const searchFields = [
        doc.title,
        doc.description,
        doc.number
      ];
      return searchFields.some(field => 
        field.toLowerCase().includes(keyword.toLowerCase())
      );
    });
  },

  // 点击文档
  onDocumentTap(e) {
    const { id } = e.currentTarget.dataset;
    // 从filteredDocuments中获取完整的文档对象
    const document = this.data.filteredDocuments.find(doc => doc.id === id);
    if (document) {
      // 将文档信息转换为查询字符串
      const documentInfo = encodeURIComponent(JSON.stringify(document));
      wx.navigateTo({
        url: `/pages/documents/document-read/document-read?id=${id}&document=${documentInfo}`,
        fail(err) {
          wx.showToast({
            title: '打开文档失败',
            icon: 'none'
          });
        }
      });
    }
  }
}); 