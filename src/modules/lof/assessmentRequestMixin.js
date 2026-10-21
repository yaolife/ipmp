// 评估页面只接收当前管段的最新请求，避免慢响应把旧管段数据写回新页面。
export default {
  data() {
    return { segmentDetailLoading: false };
  },
  beforeDestroy() {
    this.invalidateSegmentRequests();
  },
  methods: {
    invalidateSegmentRequests() {
      this._segmentRequestEpoch = (this._segmentRequestEpoch || 0) + 1;
      this._segmentRequests = {};
      this.evaluating = false;
      this.saving = false;
      this.segmentDetailLoading = false;
    },
    invalidateSegmentRequest(key) {
      if (this._segmentRequests) delete this._segmentRequests[key];
    },
    captureSegmentRequest(key) {
      const epoch = this._segmentRequestEpoch || 0;
      const segmentId = String(this.segmentId || "");
      const marker = {};
      if (!this._segmentRequests) this._segmentRequests = {};
      this._segmentRequests[key] = marker;
      return () => epoch === (this._segmentRequestEpoch || 0) &&
        segmentId === String(this.segmentId || "") &&
        this._segmentRequests[key] === marker;
    }
  }
};
