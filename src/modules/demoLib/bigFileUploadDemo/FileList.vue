<template>
  <div class="file-list">
    <div class="title">已上传文件列表</div>
    <img :src="fileUrlNew" width="200" alt="" />
    <!-- 下载配置区域 -->
    <div class="download-config">
      <div class="config-row">
        <label>分片大小:</label>
        <el-select v-model="chunkSize" size="small" style="width: 120px">
          <el-option :value="5 * 1024 * 1024" label="5MB"></el-option>
          <el-option :value="10 * 1024 * 1024" label="10MB"></el-option>
          <el-option :value="20 * 1024 * 1024" label="20MB"></el-option>
          <el-option :value="50 * 1024 * 1024" label="50MB"></el-option>
          <el-option :value="100 * 1024 * 1024" label="100MB"></el-option>
        </el-select>

        <label style="margin-left: 20px">并发线程数:</label>
        <el-select v-model="threadCount" size="small" style="width: 80px">
          <el-option :value="1" label="1"></el-option>
          <el-option :value="2" label="2"></el-option>
          <el-option :value="3" label="3"></el-option>
          <el-option :value="4" label="4"></el-option>
          <el-option :value="5" label="5"></el-option>
        </el-select>

        <div class="config-tip">
          调整分片大小和线程数可以优化下载速度，但设置过高可能导致网络压力增加
        </div>
      </div>
    </div>

    <el-table :data="fileList" border>
      <el-table-column prop="fileId" label="文件ID" width="220">
        <template #default="{ row }">
          <span class="nowrap">{{ row.fileId }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="filename" label="文件名称" width="180">
        <template #default="{ row }">
          <span class="nowrap">{{ row.filename }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="fileMd5" label="文件MD5" width="220">
        <template #default="{ row }">
          <span class="nowrap">{{ row.fileMd5 }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="fileSize" label="文件大小" width="120">
        <template #default="{ row }">
          <span class="nowrap">{{ formatFileSize(row.fileSize) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="200">
        <template #default="{ row }">
          <el-button
            size="mini"
            type="primary"
            @click="handleDownloadCommand('url', row)"
            :disabled="row.isDownloading"
            >URL下载</el-button
          >
          <el-button
            size="mini"
            type="primary"
            @click="handleDownloadCommand('direct', row)"
            :disabled="row.isDownloading"
            v-if="isSmallFile(row)"
            >直接下载</el-button
          >
          <el-button
            size="mini"
            type="primary"
            @click="handleDownloadCommand('chunk', row)"
            :disabled="row.isDownloading"
            v-if="!isSmallFile(row)"
            >分片下载</el-button
          >
          <el-button size="mini" type="info" @click="openDetailDrawer(row)"
            >详情</el-button
          >
        </template>
      </el-table-column>
      <el-table-column label="下载进度" width="250">
        <template #default="{ row }">
          <div class="progress-block">
            <div class="progress-info" v-if="row.currentOperation">
              <span>{{ row.currentOperation }}</span>
            </div>
            <el-progress
              :percentage="row.downloadPercentage"
              :format="percentFormat"
              v-bind="getProgressStatus(row.downloadStatus)"
            >
            </el-progress>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 详细信息面板 -->
    <el-drawer
      title="下载详情"
      :visible.sync="detailDrawerVisible"
      direction="rtl"
      size="50%"
      v-if="currentFile"
    >
      <div class="drawer-content" v-if="currentFile">
        <!-- 原el-descriptions组件 (隐藏) -->
        <el-descriptions v-if="false" :column="1" border>
          <el-descriptions-item label="文件名">{{
            currentFile.filename
          }}</el-descriptions-item>
          <el-descriptions-item label="文件大小">{{
            formatFileSize(currentFile.fileSize)
          }}</el-descriptions-item>
          <el-descriptions-item label="文件ID">{{
            currentFile.fileId
          }}</el-descriptions-item>
          <el-descriptions-item label="MD5">{{
            currentFile.fileMd5
          }}</el-descriptions-item>
          <el-descriptions-item label="下载状态">
            <el-tag
              :type="
                currentFile.downloadStatus == 'success'
                  ? 'success'
                  : currentFile.downloadStatus == 'exception'
                  ? 'danger'
                  : currentFile.downloadStatus == 'warning'
                  ? 'warning'
                  : 'info'
              "
            >
              {{
                currentFile.isDownloading
                  ? "下载中"
                  : currentFile.isPaused
                  ? "已暂停"
                  : currentFile.downloadStatus == "success"
                  ? "已完成"
                  : currentFile.downloadStatus == "exception"
                  ? "下载失败"
                  : "等待下载"
              }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="下载进度">
            <el-progress
              :percentage="currentFile.downloadPercentage"
              :format="percentFormat"
              v-bind="getProgressStatus(currentFile.downloadStatus)"
            >
            </el-progress>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 使用简单表格代替 -->
        <table class="file-info-table mb-15">
          <tr>
            <td class="info-label">文件名:</td>
            <td class="info-content">{{ currentFile.filename }}</td>
          </tr>
          <tr>
            <td class="info-label">文件大小:</td>
            <td class="info-content">
              {{ formatFileSize(currentFile.fileSize) }}
            </td>
          </tr>
          <tr>
            <td class="info-label">文件ID:</td>
            <td class="info-content">{{ currentFile.fileId }}</td>
          </tr>
          <tr>
            <td class="info-label">MD5:</td>
            <td class="info-content">{{ currentFile.fileMd5 }}</td>
          </tr>
          <tr>
            <td class="info-label">下载状态:</td>
            <td class="info-content">
              <el-tag
                :type="
                  currentFile.downloadStatus == 'success'
                    ? 'success'
                    : currentFile.downloadStatus == 'exception'
                    ? 'danger'
                    : currentFile.downloadStatus == 'warning'
                    ? 'warning'
                    : 'info'
                "
              >
                {{
                  currentFile.isDownloading
                    ? "下载中"
                    : currentFile.isPaused
                    ? "已暂停"
                    : currentFile.downloadStatus == "success"
                    ? "已完成"
                    : currentFile.downloadStatus == "exception"
                    ? "下载失败"
                    : "等待下载"
                }}
              </el-tag>
            </td>
          </tr>
          <tr>
            <td class="info-label">下载进度:</td>
            <td class="info-content">
              <el-progress
                :percentage="currentFile.downloadPercentage"
                :format="percentFormat"
                v-bind="getProgressStatus(currentFile.downloadStatus)"
              >
              </el-progress>
            </td>
          </tr>
          <tr>
            <td class="info-label">下载配置:</td>
            <td class="info-content">
              <div>分片大小: {{ formatFileSize(chunkSize) }}</div>
              <div style="margin-top: 5px">并发线程数: {{ threadCount }}</div>
            </td>
          </tr>
        </table>

        <!-- 下载控制按钮 -->
        <div class="download-controls">
          <el-button
            size="mini"
            type="warning"
            @click="pauseDownload(currentFile)"
            :disabled="
              !currentFile.isDownloading || currentFile.isProcessingAction
            "
            >暂停下载</el-button
          >
          <el-button
            size="mini"
            type="success"
            @click="resumeDownload(currentFile)"
            :disabled="
              currentFile.isDownloading ||
              (!currentFile.isPaused &&
                currentFile.downloadStatus !== 'exception') ||
              currentFile.isProcessingAction
            "
            >继续下载</el-button
          >
        </div>

        <!-- 操作日志 -->
        <div class="operation-logs">
          <div class="logs-header" @click="toggleFileLogs(currentFile)">
            <h4>操作日志</h4>
            <div class="log-actions">
              <el-button
                type="text"
                size="mini"
                @click.stop="clearFileLogs(currentFile)"
                >清空</el-button
              >
              <i
                :class="[
                  'el-icon-arrow-down',
                  { 'is-expanded': currentFile.logsVisible },
                ]"
              ></i>
            </div>
          </div>
          <el-collapse-transition>
            <div v-show="currentFile.logsVisible" class="logs-container">
              <el-scrollbar style="height: 300px">
                <div class="log-list">
                  <div
                    v-for="(log, index) in currentFile.logs"
                    :key="index"
                    :class="[
                      'log-item',
                      {
                        'log-error': log.type == 'error',
                        'log-success': log.type == 'success',
                        'log-info': log.type == 'info',
                      },
                    ]"
                  >
                    <span class="log-time">{{ log.time }}</span>
                    <span class="log-content">{{ log.message }}</span>
                    <span class="log-elapsed" v-if="log.elapsed"
                      >耗时: {{ log.elapsed }}</span
                    >
                    <span class="log-total-time" v-if="log.totalTime"
                      >总耗时: {{ log.totalTime }}</span
                    >
                  </div>
                  <div
                    v-if="!currentFile.logs || currentFile.logs.length == 0"
                    class="empty-log"
                  >
                    暂无操作日志
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </el-collapse-transition>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import axios from "@/api/http";
import { Message } from "element-ui";

export default {
  data() {
    return {
      fileList: [], // 存储文件列表数据
      chunkSize: 10 * 1024 * 1024, // 每次下载 10MB
      detailDrawerVisible: false, // 详情抽屉是否可见
      currentFile: null, // 当前选中的文件
      threadCount: 2, // 下载线程数
      fileUrlNew: "",
    };
  },
  methods: {
    // 格式化百分比显示
    percentFormat(percentage) {
      return percentage ? `${Math.floor(percentage)}%` : "";
    },

    // 获取进度条状态对象
    getProgressStatus(status) {
      // 只有在status为有效值时才返回status属性
      if (
        status === "success" ||
        status === "exception" ||
        status === "warning"
      ) {
        return { status };
      }
      // 其他情况下不设置status属性
      return {};
    },

    // 添加日志
    addLog(file, message, type = "info") {
      if (!file.logs) {
        file.logs = [];
      }

      const now = new Date();

      // 如果是新的下载操作或者是清空日志后的第一条日志，重置计时器
      if (!file.startTime || type === "reset") {
        file.startTime = now;
        file.lastLogTime = now;
        file.totalTime = 0;

        // 如果是reset类型，不添加日志，只重置计时器
        if (type === "reset") {
          return;
        }
      }

      const elapsedTime = now - (file.lastLogTime || file.startTime);
      file.lastLogTime = now;

      // 累计总时间（只计算info和success类型的日志）
      if (type == "info" || type == "success") {
        file.totalTime += elapsedTime;
      }

      const log = {
        time: now.toLocaleTimeString(),
        message,
        type,
        elapsed: this.formatTime(elapsedTime),
        totalTime: this.formatTime(file.totalTime),
      };

      file.logs.unshift(log);

      // 日志最多保留100条
      if (file.logs.length > 100) {
        file.logs = file.logs.slice(0, 100);
      }

      // 显示错误消息
      if (type == "error") {
        Message.error(message);
      }
    },

    // 格式化时间
    formatTime(milliseconds) {
      if (milliseconds < 1000) {
        return `${milliseconds}毫秒`;
      } else if (milliseconds < 60000) {
        return `${(milliseconds / 1000).toFixed(2)}秒`;
      } else {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = ((milliseconds % 60000) / 1000).toFixed(2);
        return `${minutes}分${seconds}秒`;
      }
    },

    // 清空文件日志
    clearFileLogs(file) {
      if (file) {
        file.logs = [];
        // 重置计时器
        this.addLog(file, "", "reset");
        this.addLog(file, "已清空日志", "info");
      }
    },

    // 打开详情抽屉
    openDetailDrawer(file) {
      this.currentFile = file;
      this.detailDrawerVisible = true;
    },

    // 初始化分片下载状态
    initDownloadState(file) {
      return {
        ...file,
        isDownloading: false, // 是否正在下载
        isPaused: false, // 是否暂停下载
        offset: 0, // 当前下载偏移量
        downloadedChunks: [], // 已下载的分片
        downloadPercentage: 0, // 下载进度百分比
        downloadStatus: "", // 下载状态，可以是 success, exception, warning 或者空字符串
        currentOperation: "", // 当前操作
        logs: [], // 操作日志
        logsVisible: true, // 操作日志是否可见
        simulatingProgress: false, // 是否正在模拟进度
        chunkProgress: {}, // 分片进度
        isProcessingAction: false, // 是否正在处理暂停/继续操作
      };
    },

    // 获取文件列表
    async fetchFileList(file) {
      try {
        console.log("【获取文件列表】发送请求:", {
          url: "/api/fileList",
        });
        this.fileList.push(this.initDownloadState(file));
        return;
        const res = await axios.get("/api/fileList");

        console.log("【获取文件列表】响应结果:", res.data);

        // 校验返回的code值
        if (res.data && res.data.code == "1") {
          const errorMsg =
            res.data.message || "获取文件列表失败: 服务器返回错误";
          Message.error(errorMsg);
          return;
        }

        this.fileList = res.data.map((file) => this.initDownloadState(file));
      } catch (error) {
        console.error("【获取文件列表】请求失败:", error);
        Message.error("获取文件列表失败: " + error.message);
      }
    },

    // 判断是否为小文件
    isSmallFile(file) {
      return file.fileSize < 50 * 1024 * 1024; // 小于50MB
    },

    // 处理下载命令
    async handleDownloadCommand(command, row) {
      if (row.isDownloading) return;

      // 确保logsVisible属性存在
      if (typeof row.logsVisible == "undefined") {
        this.$set(row, "logsVisible", true);
      }

      // 清理旧的进度状态
      this.resetDownloadState(row);

      // 打开详情抽屉
      this.openDetailDrawer(row);

      // 重置计时器
      this.addLog(row, "", "reset");

      // 添加日志
      this.addLog(row, `开始下载文件: ${row.filename}`, "info");
      this.addLog(
        row,
        `下载方式: ${
          command == "url"
            ? "URL下载"
            : command == "direct"
            ? "直接下载"
            : "分片下载"
        }`,
        "info"
      );

      switch (command) {
        case "url":
          this.downloadByUrl(row);
          break;
        case "direct":
          this.directDownload(row);
          break;
        case "chunk":
          this.startChunkDownload(row);
          break;
      }
    },

    // 重置下载状态
    resetDownloadState(row) {
      // 清理之前的下载状态
      row.downloadPercentage = 0;
      row.downloadStatus = "";
      row.currentOperation = "";
      row.isDownloading = false;
      row.isPaused = false;
      row.isPausedProcessing = false;
      row.simulatingProgress = false;
      row.isProcessingAction = false; // 重置处理操作状态
      row.offset = 0;
      row.downloadedChunks = [];
      row.chunkProgress = {};

      // 清理可能存在的队列和控制器
      if (row.abortControllers && row.abortControllers.length > 0) {
        row.abortControllers.forEach((controller) => {
          try {
            controller.abort();
          } catch (error) {
            console.error("取消下载请求失败:", error);
          }
        });
      }

      row.abortControllers = [];
      row.downloadTasks = [];
      if (row.processingChunks) {
        row.processingChunks.clear();
      } else {
        row.processingChunks = new Set();
      }
      if (row.fileStream) {
        delete row.fileStream;
      }
      if (row.chunksQueue) {
        delete row.chunksQueue;
      }
    },

    // 通过临时URL下载
    async downloadByUrl(row) {
      try {
        row.isDownloading = true;
        row.downloadStatus = ""; // 使用空字符串代替 'active'
        row.downloadPercentage = 0; // 从0开始
        row.currentOperation = "获取下载链接中...";
        this.addLog(row, "开始获取文件下载链接", "info");

        // 模拟进度增长
        let fakeProgress = 0;
        const progressTimer = setInterval(() => {
          if (row.isPaused || !row.isDownloading) {
            clearInterval(progressTimer);
            return;
          }
          fakeProgress += 5;
          if (fakeProgress >= 90) {
            clearInterval(progressTimer);
            fakeProgress = 90;
          }
          row.downloadPercentage = fakeProgress;
        }, 200);

        console.log("【URL下载】发送请求:", {
          url: `/procAttachment/getUrls`,
          ids: row.fileId,
        });

        // 获取临时URL
        const res = await axios.post(`/procAttachment/getUrls`, {
          ids: row.fileId,
        });

        // 进度达到95%
        clearInterval(progressTimer);
        row.downloadPercentage = 95;
        row.currentOperation = "准备下载文件...";

        console.log("【URL下载】响应结果:", res.data);

        // 校验返回的code值
        if (!res.data || res.data.code !== "0") {
          const errorMsg = res.data.msg || "URL下载失败: 服务器返回错误";
          this.addLog(row, errorMsg, "error");
          row.downloadStatus = "exception";
          row.isDownloading = false;
          row.currentOperation = "下载失败";
          return;
        }

        // 判断是否有响应数据
        if (
          !res.data.data ||
          !Array.isArray(res.data.data) ||
          res.data.data.length === 0
        ) {
          const errorMsg = "获取下载链接失败: 没有返回有效的文件信息";
          this.addLog(row, errorMsg, "error");
          row.downloadStatus = "exception";
          row.isDownloading = false;
          row.currentOperation = "下载失败";
          return;
        }

        // 获取第一个文件的URL
        const fileInfo = res.data.data[0];
        let downloadUrl = fileInfo.fileUrl;
        // const result = this.extractPathFromUrl(downloadUrl);
        // console.log("[ result ]-489", 'https://cuddemo4-t/mosUpload' + result);
        // this.fileUrlNew = 'https://cuddemo4-t/mosUpload'+result;
        this.fileUrlNew = downloadUrl;

        // 获取文件扩展名
        let extension = "";
        if (row.filename && row.filename.includes(".")) {
          extension = row.filename.split(".").pop();
        } else if (fileInfo.fileName && fileInfo.fileName.includes(".")) {
          extension = fileInfo.fileName.split(".").pop();
        }

        // // 将扩展名拼接到URL中第一个问号前面（如果URL不包含该扩展名）
        // if (extension && downloadUrl) {
        //   // 检查URL中是否已包含扩展名
        //   const urlPath = downloadUrl.split('?')[0];
        //   const hasExtension = urlPath.toLowerCase().endsWith('.' + extension.toLowerCase());
        //
        //   if (!hasExtension) {
        //     if (downloadUrl.includes('?')) {
        //       const urlParts = downloadUrl.split('?');
        //       downloadUrl = urlParts[0] + '.' + extension + '?' + urlParts[1];
        //     } else {
        //       downloadUrl = downloadUrl + '.' + extension;
        //     }
        //   }
        // }

        if (!downloadUrl) {
          const errorMsg = "获取下载链接失败: 文件URL不存在";
          this.addLog(row, errorMsg, "error");
          row.downloadStatus = "exception";
          row.isDownloading = false;
          row.currentOperation = "下载失败";
          return;
        }

        console.log("【URL下载】使用临时链接:", downloadUrl);
        this.addLog(row, "获取下载链接成功，开始下载", "success");
        row.currentOperation = "开始下载文件...";

        // 只有当进度低于98时才设置为98，避免重复设置导致进度条抖动
        if (row.downloadPercentage < 98) {
          row.downloadPercentage = 98;
        }

        // 处理文件名
        let filename = row.filename || fileInfo.fileName || "未命名文件";

        // 处理URL中的问号
        let baseFilename = filename;
        if (baseFilename.includes("?")) {
          baseFilename = baseFilename.split("?")[0];
        }

        // 检查是否已有扩展名
        const hasExtension =
          baseFilename.includes(".") &&
          baseFilename.split(".").pop().length > 0;

        // 如果没有扩展名，从fileInfo.fileName中获取
        if (
          !hasExtension &&
          fileInfo.fileName &&
          fileInfo.fileName.includes(".")
        ) {
          const extension = fileInfo.fileName.split(".").pop();
          if (extension) {
            filename = `${baseFilename}.${extension}`;
          }
        }

        console.log("【URL下载】最终使用的文件名:", filename);

        // 直接在新窗口打开链接而不是下载
        window.open(downloadUrl, "_blank", "noopener,noreferrer");

        // console.log('[ open ]-707', this.fileUrlNew)
        // window.open(this.fileUrlNew, "_blank", "noopener,noreferrer");



        // // 创建隐藏的a标签模拟点击下载
        // const link = document.createElement('a');
        // link.href = downloadUrl;
        // link.setAttribute('download', filename); // 使用处理后的文件名
        // link.download = filename;
        // link.style.display = 'none';
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);

        // 由于通过URL下载无法追踪进度，所以设置一个假的进度完成
        setTimeout(() => {
          row.downloadPercentage = 100;
          row.downloadStatus = "success";
          row.isDownloading = false;
          row.currentOperation = "下载完成";
          this.addLog(row, "文件下载完成", "success");
          console.log("【URL下载】下载完成");
        }, 1000);
      } catch (error) {
        console.error("【URL下载】请求失败:", error);
        this.addLog(row, "下载失败: " + error.message, "error");
        row.downloadStatus = "exception";
        row.isDownloading = false;
        row.currentOperation = "下载失败";
      }
    },
    //切割url 去除前缀地址
    extractPathFromUrl(url) {
      try {
        const urlObj = new URL(url);
        return urlObj.pathname + urlObj.search;
      } catch (error) {
        console.error("Invalid URL:", error);
        return url;
      }
    },

    // 小文件直接下载
    async directDownload(row) {
      try {
        row.isDownloading = true;
        row.downloadStatus = ""; // 使用空字符串代替 'active'
        row.downloadPercentage = 0;
        row.currentOperation = "准备下载...";
        this.addLog(row, "开始直接下载文件", "info");

        console.log("【直接下载】发送请求:", {
          url: `/procAttachment/downloadFile`,
          fileId: row.fileId,
          filename: row.filename,
          fileSize: row.fileSize,
        });

        // 记录上次更新进度的时间
        let lastProgressTime = Date.now();
        let lastProgressValue = 0;

        // 发起下载请求
        const res = await axios.post(
          `/procAttachment/downloadFile`,
          {
            fileId: row.fileId,
            filename: row.filename,
            fileSize: row.fileSize,
          },
          {
            responseType: "blob",
            onDownloadProgress: (progressEvent) => {
              if (progressEvent.lengthComputable) {
                // 计算精确的进度，保留一位小数
                const percentage = Math.min(
                  (progressEvent.loaded / progressEvent.total) * 100,
                  99.9
                );
                row.downloadPercentage = parseFloat(percentage.toFixed(2));
                row.currentOperation = `下载中... ${row.downloadPercentage}%`;

                const now = Date.now();
                // 每秒或每5%更新一次日志
                if (
                  now - lastProgressTime > 1000 ||
                  Math.floor(row.downloadPercentage) -
                    Math.floor(lastProgressValue) >=
                    5
                ) {
                  this.addLog(
                    row,
                    `下载进度: ${row.downloadPercentage}%`,
                    "info"
                  );
                  lastProgressTime = now;
                  lastProgressValue = row.downloadPercentage;
                }

                console.log(`【直接下载】进度: ${row.downloadPercentage}%`);
              }
            },
          }
        );

        console.log("【直接下载】响应结果:", {
          contentType: res.headers["content-type"],
          contentLength: res.data.size,
          status: res.status,
        });

        // 首先检查HTTP状态码
        if (res.status !== 200 && res.status !== 206) {
          const errorMsg = `直接下载失败: 服务器返回状态码 ${res.status}`;
          this.addLog(row, errorMsg, "error");
          row.downloadStatus = "exception";
          row.currentOperation = "下载失败";
          return;
        }

        // 检查响应是否为JSON格式的错误信息
        if (res.data.type && res.data.type.includes("json")) {
          // 将Blob转换为文本
          const jsonText = await res.data.text();
          try {
            const jsonData = JSON.parse(jsonText);

            // 检查服务端返回的错误码
            if (jsonData.code && jsonData.code !== "0" && jsonData.code !== 0) {
              const errorMessage =
                jsonData.msg || jsonData.message || "服务器返回错误";
              this.addLog(row, `下载失败: ${errorMessage}`, "error");
              row.downloadStatus = "exception";
              row.currentOperation = "下载失败: " + errorMessage;
              return;
            }
          } catch (parseError) {
            console.error("无法解析响应JSON:", parseError);
            // 继续处理，可能不是规范的JSON但仍是有效的文件
          }
        }

        // 从Content-Disposition头获取文件名
        let filename = row.filename || "未命名文件";
        if (res.headers["content-disposition"]) {
          const filenameMatch = res.headers["content-disposition"].match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
          );
          if (filenameMatch && filenameMatch[1]) {
            let extractedFilename = filenameMatch[1].replace(/['"]/g, "");
            // 处理URI编码的文件名
            try {
              extractedFilename = decodeURIComponent(extractedFilename);
              if (extractedFilename && extractedFilename.trim() !== "") {
                filename = extractedFilename;
              }
            } catch (e) {
              console.error("解码文件名错误:", e);
              // 解码失败时保留原始文件名
            }
          }
        }

        // 确保文件名有扩展名
        if (
          filename &&
          !filename.includes(".") &&
          row.filename &&
          row.filename.includes(".")
        ) {
          const extension = row.filename.split(".").pop();
          if (extension) {
            filename = `${filename}.${extension}`;
          }
        }

        // 获取正确的MIME类型
        let contentType =
          res.headers["content-type"] || "application/octet-stream";
        // 根据文件扩展名推断MIME类型（如果服务器未返回或返回不正确）
        if (
          contentType === "application/octet-stream" &&
          filename.includes(".")
        ) {
          const extension = filename.split(".").pop().toLowerCase();
          const mimeMap = {
            pdf: "application/pdf",
            doc: "application/msword",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            xls: "application/vnd.ms-excel",
            xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ppt: "application/vnd.ms-powerpoint",
            pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            gif: "image/gif",
            txt: "text/plain",
            zip: "application/zip",
            rar: "application/x-rar-compressed",
            mp4: "video/mp4",
            mp3: "audio/mpeg",
          };
          if (extension && mimeMap[extension]) {
            contentType = mimeMap[extension];
          }
        }

        console.log(
          "【直接下载】使用文件名:",
          filename,
          "内容类型:",
          contentType
        );
        row.downloadPercentage = 100;
        row.currentOperation = "下载完成，保存文件中...";

        // 创建正确的Blob对象
        const blob = new Blob([res.data], { type: contentType });
        const url = window.URL.createObjectURL(blob);

        // 创建下载链接
        const link = document.createElement("a");
        link.href = url;
        link.download = filename; // 使用正确的文件名
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();

        // 清理
        setTimeout(() => {
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }, 100);

        console.log("【直接下载】下载完成，文件名:", filename);
        this.addLog(row, `文件下载完成: ${filename}`, "success");
        row.downloadStatus = "success";
        row.downloadPercentage = 100;
        row.currentOperation = "下载完成";
      } catch (error) {
        console.error("【直接下载】请求失败:", error);
        this.addLog(row, "下载失败: " + error.message, "error");
        row.downloadStatus = "exception";
        row.currentOperation = "下载失败";
      } finally {
        row.isDownloading = false;
      }
    },

    // 开始分片下载（大文件）
    async startChunkDownload(row) {
      console.log("【分片下载】方法开始执行，状态检查:", {
        isDownloading: row.isDownloading,
        isPaused: row.isPaused,
        downloadStatus: row.downloadStatus,
      });

      // 如果已经暂停了但状态没有更新，强制更新状态
      if (row.isPaused && row.isDownloading) {
        console.log("【分片下载】状态不一致，重置状态");
        row.isDownloading = false;
      }

      // 如果状态不一致，重新设置下载中状态
      if (!row.isDownloading) {
        console.log("【分片下载】设置下载中状态");
        row.isDownloading = true;
      }

      // 确保正确的标志设置
      row.isPaused = false;
      row.isPausedProcessing = false; // 重置暂停处理标记
      row.downloadStatus = ""; // 使用空字符串代替 'active'

      // 保留下载进度，如果是继续下载
      if (!row.downloadedChunks || row.downloadedChunks.length === 0) {
        row.downloadPercentage = 0; // 只有新下载才重置进度
      }

      // 确保控制器数组存在
      if (!row.abortControllers) {
        row.abortControllers = [];
      }

      // 确保下载任务数组存在
      if (!row.downloadTasks) {
        row.downloadTasks = [];
      } else {
        row.downloadTasks = []; // 重置任务列表
      }

      // 初始化处理中的分片集合
      if (!row.processingChunks) {
        row.processingChunks = new Set();
      } else {
        row.processingChunks.clear(); // 清空处理中的分片
      }

      // 重置计时器只在首次下载时
      if (!row.downloadedChunks || row.downloadedChunks.length === 0) {
        this.addLog(row, "", "reset");
        this.addLog(row, `开始分片下载文件: ${row.filename}`, "info");
      } else {
        this.addLog(row, `继续分片下载文件: ${row.filename}`, "info");
      }

      // 计算总分片数
      const totalChunks = Math.ceil(row.fileSize / this.chunkSize);
      // 每个分片的大小（除了最后一个可能较小）
      const lastChunkSize = row.fileSize % this.chunkSize || this.chunkSize;

      // 计算各种容量
      const totalSizeMB = (row.fileSize / (1024 * 1024)).toFixed(2);
      const chunkSizeMB = (this.chunkSize / (1024 * 1024)).toFixed(2);
      const lastChunkSizeMB = (lastChunkSize / (1024 * 1024)).toFixed(2);

      this.addLog(
        row,
        `文件总大小: ${totalSizeMB}MB，分片大小: ${chunkSizeMB}MB，最后一片: ${lastChunkSizeMB}MB`,
        "info"
      );

      // 确保下载状态正确初始化
      if (!row.downloadedChunks) {
        row.downloadedChunks = [];
      }

      if (!row.fileStream) {
        row.fileStream = [];
      }

      if (!row.offset) {
        row.offset = 0;
      }

      if (row.downloadedChunks.length === 0) {
        // 重置下载状态（只在全新下载时）
        row.offset = 0;
        row.fileStream = [];
      } else {
        const downloadedSizeMB =
          ((row.downloadedChunks.length - 1) * this.chunkSize +
            (row.downloadedChunks.includes(totalChunks - 1)
              ? lastChunkSize
              : 0)) /
          (1024 * 1024);
        const remainingSizeMB = totalSizeMB - downloadedSizeMB.toFixed(2);

        this.addLog(
          row,
          `从断点继续下载，已完成 ${row.downloadedChunks.length}/${totalChunks} 个分片，` +
            `已下载 ${downloadedSizeMB.toFixed(
              2
            )}MB，剩余 ${remainingSizeMB}MB`,
          "info"
        );
      }

      try {
        console.log("【分片下载】计算待下载分片");
        // 计算剩余需要下载的分片
        const chunksToDownload = Array.from(
          { length: totalChunks },
          (_, index) => index
        ).filter((index) => !row.downloadedChunks.includes(index));

        console.log(
          `【分片下载】找到 ${chunksToDownload.length} 个分片需要下载`
        );

        // 如果没有剩余分片需要下载，直接完成
        if (chunksToDownload.length === 0) {
          this.addLog(row, "所有分片已下载完成，准备保存文件", "success");
          this.saveFile(row.fileStream, row.filename);
          row.downloadPercentage = 100;
          row.downloadStatus = "success";
          row.isDownloading = false;
          row.offset = 0;
          row.downloadedChunks = [];
          delete row.fileStream;
          delete row.chunksQueue;
          delete row.downloadTasks;
          delete row.abortControllers;
          this.addLog(
            row,
            `文件 ${row.filename} (${totalSizeMB}MB) 下载完成`,
            "success"
          );
          return;
        }

        const remainingSizeMB = chunksToDownload
          .reduce((total, chunkIndex) => {
            if (chunkIndex === totalChunks - 1) {
              return total + lastChunkSize / (1024 * 1024);
            }
            return total + this.chunkSize / (1024 * 1024);
          }, 0)
          .toFixed(2);

        this.addLog(
          row,
          `文件共 ${totalChunks} 个分片，待下载 ${chunksToDownload.length} 个分片，` +
            `剩余容量 ${remainingSizeMB}MB`,
          "info"
        );

        // 创建一个共享的队列，以便线程可以动态获取任务
        row.chunksQueue = [...chunksToDownload];

        // 分配任务给多个线程
        this.addLog(row, `使用 ${this.threadCount} 个线程并行下载`, "info");
        row.downloadTasks = [];

        console.log(`【分片下载】启动 ${this.threadCount} 个线程下载`);
        for (let i = 0; i < this.threadCount; i++) {
          const task = this.downloadChunks(row, i, totalChunks);
          row.downloadTasks.push(task);
        }

        console.log("【分片下载】等待所有线程完成下载");
        await Promise.all(row.downloadTasks);
        console.log("【分片下载】所有线程下载任务完成");

        if (!row.isPaused && row.offset >= row.fileSize) {
          this.addLog(row, "所有分片下载完成，准备保存文件", "success");
          this.saveFile(row.fileStream, row.filename);
          row.downloadPercentage = 100;
          row.downloadStatus = "success";
          row.isDownloading = false;
          row.offset = 0;
          row.downloadedChunks = [];
          delete row.fileStream;
          delete row.chunksQueue;
          delete row.downloadTasks;
          delete row.abortControllers;
          this.addLog(
            row,
            `文件 ${row.filename} (${totalSizeMB}MB) 下载完成`,
            "success"
          );
        }
      } catch (error) {
        console.error("【分片下载】下载过程中出错:", error);
        row.downloadStatus = "exception";
        this.addLog(row, `分片下载失败: ${error.message}`, "error");
        if (!row.isPaused) {
          row.isDownloading = false;

          // 添加"继续下载"按钮的提示
          this.addLog(
            row,
            '下载发生错误，您可以点击"继续下载"按钮从断点处继续',
            "error"
          );
        }
      }
    },

    // 下载分片（单线程任务）
    async downloadChunks(row, threadId, totalChunks) {
      // 记录已下载分片数
      let downloadedByThisThread = 0;
      console.log(
        `【分片下载】线程${threadId} 开始运行，队列长度:`,
        row.chunksQueue ? row.chunksQueue.length : 0
      );

      try {
        while (row.chunksQueue && row.chunksQueue.length > 0 && !row.isPaused) {
          // 多线程并发时，通过原子操作获取一个分片索引
          const chunkIndex = row.chunksQueue.shift();
          if (chunkIndex == undefined) break;

          console.log(
            `【分片下载】线程${threadId} 获取到分片任务:${chunkIndex}`
          );

          const offset = chunkIndex * this.chunkSize;
          const contentLength = Math.min(this.chunkSize, row.fileSize - offset);
          // 判断是否是最后一个分片
          const isLastChunk = chunkIndex === totalChunks - 1;

          try {
            console.log(`【分片下载】线程${threadId} - 准备发送请求:`, {
              url: "/procAttachment/downloadChunk",
              fileId: row.fileId,
              offset: offset,
              filename: row.filename,
              contentLength: contentLength,
              chunkIndex: chunkIndex,
            });

            // 更新当前操作和添加下载日志
            const chunkMB = (contentLength / (1024 * 1024)).toFixed(2);
            const remainingChunks = row.chunksQueue.length;
            const totalRemainingMB = (
              (remainingChunks * this.chunkSize) /
              (1024 * 1024)
            ).toFixed(2);

            row.currentOperation =
              `线程${threadId + 1}下载分片${chunkIndex + 1}/${totalChunks}，` +
              `剩余${remainingChunks}片(~${totalRemainingMB}MB)`;

            this.addLog(
              row,
              `线程${threadId + 1}开始下载分片${
                chunkIndex + 1
              }/${totalChunks}，` +
                `大小: ${chunkMB}MB${isLastChunk ? " (最后一片)" : ""}，` +
                `剩余${remainingChunks}片`,
              "info"
            );

            const startTime = Date.now();

            // 开始模拟进度的变量
            let simulatedProgress = 0;
            let progressInterval = null;

            // 启动进度模拟器
            if (!row.simulatingProgress) {
              row.simulatingProgress = true;

              // 估计下载时间 - 根据大小估算，假设平均速度为5MB/s
              const estimatedTimeMs =
                (contentLength / (5 * 1024 * 1024)) * 1000;
              const updateInterval = Math.max(
                100,
                Math.min(500, estimatedTimeMs / 20)
              ); // 最少100ms，最多500ms

              progressInterval = setInterval(() => {
                if (row.isPaused || !row.simulatingProgress) {
                  clearInterval(progressInterval);
                  return;
                }

                // 使用easeInOutQuad缓动函数使进度更自然
                simulatedProgress += 5;
                if (simulatedProgress >= 99) {
                  clearInterval(progressInterval);
                }

                // 更新当前分片的进度
                this.updateChunkProgress(
                  row,
                  chunkIndex,
                  totalChunks,
                  simulatedProgress
                );
              }, updateInterval);
            }

            // 创建AbortController实例，用于取消请求
            const abortController = new AbortController();
            if (!row.abortControllers) {
              row.abortControllers = [];
            }
            row.abortControllers.push(abortController);

            // 记录当前正在处理的分片，防止重复处理
            if (!row.processingChunks) {
              row.processingChunks = new Set();
            }
            row.processingChunks.add(chunkIndex);

            const res = await axios.post(
              "/procAttachment/downloadChunk",
              {
                fileId: row.fileId,
                offset: offset,
                filename: row.filename,
                contentLength: contentLength,
              },
              {
                responseType: "arraybuffer", // 接收二进制数据
                signal: abortController.signal, // 添加signal用于取消请求
              }
            );

            console.log(`【分片下载】线程${threadId} - 请求完成，开始处理响应`);

            // 如果已暂停，不再处理响应
            if (row.isPausedProcessing) {
              console.log(
                `【分片下载】线程${threadId} - 分片 ${chunkIndex} 响应返回，但下载已暂停，忽略此响应`
              );
              // 确保分片被重新加入队列
              if (row.chunksQueue && !row.chunksQueue.includes(chunkIndex)) {
                row.chunksQueue.push(chunkIndex);
              }
              // 从处理中的分片集合移除
              if (row.processingChunks) {
                row.processingChunks.delete(chunkIndex);
              }
              break;
            }

            // 请求完成后从控制器列表中移除
            const controllerIndex =
              row.abortControllers.indexOf(abortController);
            if (controllerIndex !== -1) {
              row.abortControllers.splice(controllerIndex, 1);
            }

            // 清除进度模拟器
            if (progressInterval) {
              clearInterval(progressInterval);
            }
            row.simulatingProgress = false;

            console.log(`【分片下载】线程${threadId} - 响应结果:`, {
              contentLength: res.data.byteLength,
              status: res.status,
              chunkIndex: chunkIndex,
            });

            // 首先检查HTTP状态码
            if (res.status !== 200 && res.status !== 206) {
              throw new Error(`分片下载失败: 服务器返回状态码 ${res.status}`);
            }

            // 检查是否返回JSON格式错误
            // 尝试将ArrayBuffer转换为文本并解析JSON
            if (res.data.byteLength > 0 && res.data.byteLength < 1024) {
              // 如果数据很小，可能是错误信息
              try {
                const textDecoder = new TextDecoder("utf-8");
                const text = textDecoder.decode(res.data);

                // 尝试解析为JSON
                if (text.trim().startsWith("{") && text.trim().endsWith("}")) {
                  try {
                    const jsonData = JSON.parse(text);
                    if (
                      jsonData.code &&
                      jsonData.code !== "0" &&
                      jsonData.code !== 0
                    ) {
                      const errorMessage =
                        jsonData.msg || jsonData.message || "服务器返回错误";
                      throw new Error(`服务器返回错误: ${errorMessage}`);
                    }
                  } catch (jsonError) {
                    console.log("非JSON响应或有效的二进制数据");
                    // 可能不是JSON，继续处理
                  }
                }
              } catch (textError) {
                console.log("无法解码为文本，继续处理为二进制数据");
                // 无法解码为文本，继续处理为二进制数据
              }
            }

            // 初始化文件流数组（如果不存在）
            if (!row.fileStream) {
              row.fileStream = [];
            }

            // 从处理中的分片集合移除
            if (row.processingChunks) {
              row.processingChunks.delete(chunkIndex);
            }

            // 确保分片没有被重复处理
            if (!row.downloadedChunks.includes(chunkIndex)) {
              row.fileStream[chunkIndex] = res.data;
              row.downloadedChunks.push(chunkIndex);
              row.offset += contentLength;
              downloadedByThisThread++;

              // 更新下载进度 - 设置为100%完成
              this.updateChunkProgress(row, chunkIndex, totalChunks, 100);

              // 计算下载耗时和速度
              const downloadTime = Date.now() - startTime;
              const speedMBps =
                contentLength / 1024 / 1024 / (downloadTime / 1000);

              // 计算总体下载情况
              const totalDownloaded = row.downloadedChunks.length;
              const remainingChunksTotal = totalChunks - totalDownloaded;
              const remainingSizeMB =
                ((remainingChunksTotal - 1) * this.chunkSize +
                  (remainingChunksTotal > 0 &&
                  !row.downloadedChunks.includes(totalChunks - 1)
                    ? row.fileSize % this.chunkSize || this.chunkSize
                    : 0)) /
                (1024 * 1024);

              this.addLog(
                row,
                `线程${threadId + 1}分片${
                  chunkIndex + 1
                }/${totalChunks}下载完成，` +
                  `速度: ${speedMBps.toFixed(2)}MB/s，总进度: ${
                    row.downloadPercentage
                  }%，` +
                  `已完成: ${totalDownloaded}/${totalChunks}片，` +
                  `剩余: ${remainingChunksTotal}片(~${remainingSizeMB.toFixed(
                    2
                  )}MB)`,
                "success"
              );

              console.log(
                `【分片下载】线程 ${threadId} 下载完成分片 ${chunkIndex}, 偏移量: ${offset}, 整体进度: ${row.downloadPercentage}%`
              );
            } else {
              console.log(
                `【分片下载】线程 ${threadId} 分片 ${chunkIndex} 已经处理过，忽略重复响应`
              );
            }
          } catch (error) {
            // 检查是否是因为用户取消导致的错误
            if (
              error.name === "AbortError" ||
              error.message.includes("canceled")
            ) {
              console.log(
                `【分片下载】线程${threadId} - 分片 ${chunkIndex} 下载已取消`
              );
              this.addLog(
                row,
                `分片 ${chunkIndex + 1}/${totalChunks} 下载已取消`,
                "warning"
              );

              // 将取消的任务重新加入队列，以便下次继续下载
              if (row.chunksQueue && !row.chunksQueue.includes(chunkIndex)) {
                row.chunksQueue.push(chunkIndex);
              }

              // 从处理中的分片集合移除
              if (row.processingChunks) {
                row.processingChunks.delete(chunkIndex);
              }

              // 停止当前任务
              break;
            }

            // 停止进度模拟
            row.simulatingProgress = false;

            console.error(
              `【分片下载】线程${threadId} - 分片 ${chunkIndex} 下载失败:`,
              error
            );
            // 失败的分片重新加入队列
            if (row.chunksQueue && !row.chunksQueue.includes(chunkIndex)) {
              row.chunksQueue.push(chunkIndex);
            }

            // 从处理中的分片集合移除
            if (row.processingChunks) {
              row.processingChunks.delete(chunkIndex);
            }

            // 记录失败信息
            this.addLog(
              row,
              `分片 ${chunkIndex + 1}/${totalChunks} 下载失败: ${
                error.message
              }`,
              "error"
            );
            // 随机延迟一下，避免同一个出错的分片反复重试
            await new Promise((resolve) =>
              setTimeout(resolve, 1000 + Math.random() * 2000)
            );

            // 连续失败3次后，抛出异常但保留下载状态，让用户可以继续尝试
            const failedCount =
              row.failedChunks && row.failedChunks[chunkIndex]
                ? row.failedChunks[chunkIndex]
                : 0;
            if (!row.failedChunks) row.failedChunks = {};
            row.failedChunks[chunkIndex] = failedCount + 1;

            if (row.failedChunks[chunkIndex] >= 3) {
              row.currentOperation = '下载部分失败，可点击"继续下载"重试';
              throw new Error(
                `分片 ${chunkIndex + 1}/${totalChunks} 多次下载失败，暂停下载`
              );
            }
          }
        }
      } catch (error) {
        console.error(`【分片下载】线程${threadId} 出现异常:`, error);
        throw error;
      } finally {
        // 线程完成后的统计
        if (downloadedByThisThread > 0) {
          this.addLog(
            row,
            `线程${threadId + 1}已完成${downloadedByThisThread}个分片的下载`,
            "info"
          );
        } else if (row.isPaused) {
          this.addLog(
            row,
            `线程${threadId + 1}已暂停，未完成任何分片下载`,
            "info"
          );
        }

        console.log(`【分片下载】线程${threadId} 已结束`);
      }
    },

    // 更新特定分片的下载进度
    updateChunkProgress(row, chunkIndex, totalChunks, chunkProgress) {
      // 如果还没有进度对象，则初始化
      if (!row.chunkProgress) {
        row.chunkProgress = {};
      }

      // 更新当前分片的进度
      row.chunkProgress[chunkIndex] = chunkProgress;

      // 计算总体进度
      let totalProgress = 0;
      let progressedChunks = 0;

      // 计算已完成分片的贡献
      for (const idx of row.downloadedChunks) {
        if (idx !== chunkIndex) {
          // 排除当前正在下载的分片
          totalProgress += 100; // 完成的分片贡献100%
          progressedChunks++;
        }
      }

      // 添加当前下载中分片的贡献
      for (const [idx, progress] of Object.entries(row.chunkProgress)) {
        if (!row.downloadedChunks.includes(parseInt(idx))) {
          // 确保未包括在已完成分片中
          totalProgress += progress;
          progressedChunks++;
        }
      }

      // 计算最终百分比
      let finalPercentage = 0;
      if (progressedChunks > 0) {
        finalPercentage = totalProgress / totalChunks;
      }

      // 更新总进度
      row.downloadPercentage = parseFloat(finalPercentage.toFixed(2));
    },

    // 暂停下载
    async pauseDownload(row) {
      if (!row.isDownloading || row.isProcessingAction) return;

      // 设置正在处理操作状态
      row.isProcessingAction = true;

      // 设置暂停标志
      row.isPaused = true;
      row.isDownloading = false;
      row.downloadStatus = "warning";

      // 标记暂停状态，用于防止回调函数继续执行
      row.isPausedProcessing = true;

      // 取消所有正在进行的HTTP请求
      if (row.abortControllers && row.abortControllers.length > 0) {
        this.addLog(
          row,
          `正在取消 ${row.abortControllers.length} 个下载任务...`,
          "warning"
        );
        row.abortControllers.forEach((controller) => {
          try {
            controller.abort();
          } catch (error) {
            console.error("取消下载请求失败:", error);
          }
        });
        // 清空控制器列表
        row.abortControllers = [];
      }

      // 如果有进度模拟器，也要停止
      row.simulatingProgress = false;

      this.addLog(row, "下载已暂停", "warning");
      console.log("下载已暂停");
      row.currentOperation = "下载已暂停";

      // 延迟一段时间后重置处理操作状态，确保所有操作完成
      setTimeout(() => {
        row.isProcessingAction = false;
      }, 500);
    },

    // 继续下载
    async resumeDownload(row) {
      // 添加调试日志查看状态
      console.log("【继续下载】点击按钮状态检查:", {
        isDownloading: row.isDownloading,
        isPaused: row.isPaused,
        downloadStatus: row.downloadStatus,
        isProcessingAction: row.isProcessingAction,
        downloadedChunks: row.downloadedChunks
          ? row.downloadedChunks.length
          : 0,
      });

      // 放宽条件判断，确保可以继续下载
      if (row.isDownloading && !row.isPaused) {
        console.log("【继续下载】已经在下载中，忽略");
        return;
      }

      // 设置正在处理操作状态
      row.isProcessingAction = true;
      console.log("【继续下载】开始处理下载任务");

      // 确保没有正在进行的任务
      if (row.abortControllers && row.abortControllers.length > 0) {
        this.addLog(
          row,
          `发现 ${row.abortControllers.length} 个未完成的下载任务，正在取消...`,
          "warning"
        );
        row.abortControllers.forEach((controller) => {
          try {
            controller.abort();
          } catch (error) {
            console.error("取消下载请求失败:", error);
          }
        });
        // 清空控制器列表
        row.abortControllers = [];
      }

      // 重置暂停处理标记
      row.isPausedProcessing = false;

      // 重置错误状态
      row.downloadStatus = ""; // 使用空字符串代替 'active'
      row.isPaused = false;

      // 重置失败次数计数
      row.failedChunks = {};

      this.addLog(row, "继续下载文件", "info");
      console.log("【继续下载】重置状态完成，准备开始下载");

      // 重置处理状态，确保可以暂停
      row.isProcessingAction = false;
      row.isDownloading = true;

      try {
        console.log("【继续下载】调用startChunkDownload方法");
        await this.startChunkDownload(row);
        console.log("【继续下载】startChunkDownload方法执行完成");
      } catch (error) {
        console.error("【继续下载】继续下载失败:", error);
        this.addLog(row, "继续下载失败: " + error.message, "error");
      } finally {
        // 此处不需要重置isProcessingAction，因为已在上面重置过
        console.log("【继续下载】下载流程执行完毕");
      }
    },

    // 保存文件
    saveFile(fileStream, filename) {
      const blob = new Blob(fileStream);
      const downloadElement = document.createElement("a");
      const href = window.URL.createObjectURL(blob);
      downloadElement.href = href;
      downloadElement.download = filename;
      downloadElement.click();
      window.URL.revokeObjectURL(href);
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes == 0) return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB", "TB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    },

    // 切换文件日志面板显示/隐藏
    toggleFileLogs(file) {
      if (!file) return;
      // 确保logsVisible属性存在
      if (typeof file.logsVisible == "undefined") {
        this.$set(file, "logsVisible", true);
      }
      file.logsVisible = !file.logsVisible;
    },
  },
  mounted() {
    // this.fetchFileList(); // 组件挂载时获取文件列表
  },
};
</script>

<style scoped>
.title {
  font-size: 20px;
  padding-bottom: 20px;
}
.file-list {
  /* padding: 20px; */
}

.download-config {
  margin: 0 auto 15px;
  padding: 10px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border: 1px solid #e4e7ed;
}

.config-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.config-row label {
  margin-right: 8px;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.config-tip {
  color: #909399;
  font-size: 12px;
  margin-left: 15px;
}

.nowrap {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.drawer-content {
  padding: 20px;
}

.progress-block {
  margin: 5px 0;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  min-height: 20px;
}

/* 使用::v-deep穿透scoped样式 */
::v-deep .el-drawer__body {
  padding: 0;
  overflow: auto;
}

.mb-15 {
  margin-bottom: 15px;
}

.download-controls {
  margin: 15px 0;
  display: flex;
  gap: 10px;
}

.log-items {
  margin-top: 10px;
}

.operation-logs {
  margin-top: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.logs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 5px 0;
}

.logs-header:hover {
  background-color: #f5f7fa;
}

.log-actions {
  display: flex;
  align-items: center;
}

.log-actions i {
  transition: transform 0.3s;
  margin-left: 5px;
}

.log-actions i.is-expanded {
  transform: rotate(180deg);
}

.logs-container {
  height: 200px;
  overflow: hidden;
}

.log-list {
  text-align: left;
  padding-right: 10px;
}

.log-item {
  margin-bottom: 5px;
  padding: 5px;
  border-radius: 4px;
  transition: background-color 0.3s;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
}

.log-item:hover {
  background-color: #f5f7fa;
}

.log-time {
  color: #909399;
  margin-right: 10px;
  font-size: 12px;
  min-width: 70px;
}

.log-content {
  font-size: 14px;
  flex: 1;
  margin-right: 10px;
  word-break: break-word;
  max-width: calc(100% - 250px);
}

.log-elapsed {
  color: #e6a23c;
  font-size: 12px;
  margin-right: 10px;
  white-space: nowrap;
}

.log-total-time {
  color: #409eff;
  font-size: 12px;
  white-space: nowrap;
}

.log-error {
  color: #f56c6c;
}

.log-success {
  color: #67c23a;
}

.log-info {
  color: #409eff;
}

.empty-log {
  color: #909399;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

/* 文件信息表格样式 */
.file-info-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #ebeef5;
  font-size: 14px;
}

.file-info-table td {
  padding: 12px 10px;
  border: 1px solid #ebeef5;
}

.file-info-table .info-label {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: bold;
  width: 15%;
  text-align: right;
}

.file-info-table .info-content {
  color: #303133;
  width: 85%;
  padding-left: 10px;
}

/* 强制el-scrollbar组件高度 */
::v-deep .el-scrollbar {
  height: 200px !important;
}

::v-deep .el-scrollbar__wrap {
  overflow-x: hidden;
}

/* 为el-descriptions添加样式穿透（即使当前隐藏了也添加，以备将来可能重新启用） */
::v-deep .el-descriptions {
  box-sizing: border-box;
  font-size: 14px;
  color: #303133;
}

::v-deep .el-descriptions__body {
  background-color: #fff;
}

::v-deep .el-descriptions__body .el-descriptions__table {
  border-collapse: collapse;
  width: 100%;
  table-layout: fixed;
}

::v-deep
  .el-descriptions__body
  .el-descriptions__table
  .el-descriptions-item__cell {
  box-sizing: border-box;
  text-align: left;
  font-weight: 400;
  line-height: 1.5;
  padding: 12px 10px;
}

::v-deep
  .el-descriptions__body
  .el-descriptions__table
  .el-descriptions-item__label {
  color: #909399;
  font-weight: bold;
  min-width: 50px;
}

::v-deep
  .el-descriptions.is-bordered
  .el-descriptions__body
  .el-descriptions__table {
  border: 1px solid #ebeef5;
}

::v-deep
  .el-descriptions.is-bordered
  .el-descriptions__body
  .el-descriptions__table
  .el-descriptions-item__cell {
  border-right: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}
</style>
