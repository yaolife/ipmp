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
        // 当前评估范围尚未限定具体元件类型，只排除没有元件类型的纯目录节点。
        // 保留所有业务节点，确保从三维台账携带 segmentId 跳转时能够正确回填选中项。
        const isAssessmentObject = node.componentType != null;
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
        .getResourceDirectoryTree()
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
