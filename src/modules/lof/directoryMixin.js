import api from "./api";
import { isSuccessCode, unwrapList } from "./utils";

export default {
  data() {
    return {
      pageLoading: false,
      segments: [],
      segmentId: "",
      currentSegment: null
    };
  },
  created() {
    this.loadSegments();
  },
  methods: {
    isSuccessCode: isSuccessCode,
    unwrapList: unwrapList,
    segmentLabel(item) {
      if (!item) return "-";
      if (item.labelPath) return item.labelPath;
      const no = item.pipelineNo || item.segmentNo || item.nodeName || item.kks || "";
      const name = item.pipelineName || item.segmentName || item.name || "";
      if (no && name && no !== name) return no + "（" + name + "）";
      return no || name || item.id || "-";
    },
    flattenDirectoryNodes(nodes, path) {
      const list = [];
      (nodes || []).forEach(node => {
        if (!node) return;
        const name = node.nodeName || node.pipelineName || node.name || "";
        const nextPath = path ? (name ? path + " / " + name : path) : name;
        const children = Array.isArray(node.children) ? node.children : [];
        const nameText = String(node.nodeName || "").trim();
        // 三个评估页面的评估对象已经明确为0-管段。
        // 后端会保留管段的祖先路径，因此这里再次校验类型，避免有类型的祖先节点进入下拉框。
        const isAssessmentObject = Number(node.componentType) === 0;
        if (
          isAssessmentObject &&
          node.id != null &&
          node.id !== "" &&
          nameText &&
          nameText !== "0"
        ) {
          list.push(
            Object.assign({}, node, {
              id: String(node.id),
              labelPath: nextPath || String(node.id)
            })
          );
        }
        if (children.length) {
          list.push.apply(list, this.flattenDirectoryNodes(children, nextPath));
        }
      });
      return list;
    },
    loadSegments() {
      this.pageLoading = true;
      api
        .getResourceDirectoryTree({ componentType: 0 })
        .then(res => {
          this.pageLoading = false;
          if (!this.isSuccessCode(res && res.code)) {
            this.$message.error((res && res.msg) || "管段列表加载失败");
            return;
          }
          const tree = Array.isArray(res.data) ? res.data : this.unwrapList(res.data);
          this.segments = this.flattenDirectoryNodes(tree, "");
          const routeQuery = (this.$route && this.$route.query) || {};
          const requestedId = routeQuery.segmentId || routeQuery.segment;
          if (requestedId && this.segments.some(item => item.id === String(requestedId))) {
            this.segmentId = String(requestedId);
            if (typeof this.onSegmentChange === "function") {
              this.onSegmentChange(this.segmentId);
            }
          }
        })
        .catch(() => {
          this.pageLoading = false;
          this.$message.error("管段列表加载失败");
        });
    },
    loadSegmentDetail(id) {
      if (!id) {
        this.currentSegment = null;
        if (typeof this.onSegmentLoaded === "function") this.onSegmentLoaded(null);
        return Promise.resolve(null);
      }
      const local = this.segments.find(item => item.id === id) || null;
      this.currentSegment = local;
      return api
        .getResourceDirectoryDetail(id)
        .then(res => {
          if (this.isSuccessCode(res && res.code) && res.data) {
            this.currentSegment = Object.assign({}, local || {}, res.data);
          }
          if (typeof this.onSegmentLoaded === "function") {
            this.onSegmentLoaded(this.currentSegment);
          }
          return this.currentSegment;
        })
        .catch(() => {
          this.$message.error("管段详情加载失败");
          if (typeof this.onSegmentLoaded === "function") {
            this.onSegmentLoaded(this.currentSegment);
          }
          return this.currentSegment;
        });
    }
  }
};
