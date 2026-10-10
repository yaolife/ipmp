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
  activated() {
    // 缓存页面再次进入时created不会执行，必须重新应用跳转指定的管段。
    this.selectRouteSegment((this.$route && this.$route.query) || {});
  },
  beforeRouteUpdate(to, from, next) {
    this.selectRouteSegment(to.query || {});
    next();
  },
  methods: {
    isSuccessCode: isSuccessCode,
    unwrapList: unwrapList,
    selectRouteSegment(query) {
      const requestedId = query.segmentId || query.segment;
      if (requestedId == null || requestedId === "") return;
      const id = String(requestedId);
      // 等待树加载完成后再选择，确保下拉选项和详情请求使用同一字符串ID。
      if (!this.segments.some(item => item.id === id) || this.segmentId === id) return;
      this.segmentId = id;
      if (typeof this.onSegmentChange === "function") this.onSegmentChange(id);
    },
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
        const isLeaf = !children.length;
        const isLevel5 = Number(node.levelNo) === 5;
        // 最新模型树的管段节点不再依赖固定的moduleType或componentType编码，
        // 只把叶子节点及第五层管段节点放入选择框，避免把系统、装置等父级目录当成评估对象。
        if (
          (isLeaf || isLevel5) &&
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
        .getLatestEnabledModelTree()
        .then(res => {
          this.pageLoading = false;
          if (!this.isSuccessCode(res && res.code)) {
            this.$message.error((res && res.msg) || "管段列表加载失败");
            return;
          }
          const tree = Array.isArray(res.data) ? res.data : this.unwrapList(res.data);
          this.segments = this.flattenDirectoryNodes(tree, "");
          this.selectRouteSegment((this.$route && this.$route.query) || {});
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
