<template>
  <div class="upload-container">
    <!-- 文件选择区域 -->
    <el-upload class="upload-demo" action="#" :auto-upload="false" :on-change="handleFileChange" :show-file-list="false"
      :disabled="isCalculatingMd5 || isUploading">
      <el-button size="small" type="primary" :disabled="isCalculatingMd5 || isUploading">
        <i class="el-icon-upload"></i> 选择文件
      </el-button>
      <span v-if="isCalculatingMd5" class="ml-10">
        <i class="el-icon-loading"></i> 正在计算文件MD5，请稍候...
      </span>
    </el-upload>

    <!-- 简单的配置区域 -->
    <div v-if="selectedFile && !isUploading && !isCalculatingMd5" class="simple-config">
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
        <el-select v-model="concurrentLimit" size="small" style="width: 80px">
          <el-option :value="1" label="1"></el-option>
          <el-option :value="2" label="2"></el-option>
          <el-option :value="3" label="3"></el-option>
          <el-option :value="4" label="4"></el-option>
          <el-option :value="5" label="5"></el-option>
        </el-select>
      </div>
    </div>

    <!-- 上传进度和操作 -->
    <div v-if="selectedFile" class="upload-status">
      <!-- 使用简单表格代替 -->
      <table v-if="selectedFile" class="file-info-table mb-15">
        <tr>
          <td class="info-label">文件名:</td>
          <td class="info-content">{{ selectedFile.name }}</td>
          <td class="info-label">文件大小:</td>
          <td class="info-content">{{ formatFileSize(selectedFile.size) }}</td>
        </tr>
        <tr v-if="fileMd5">
          <td class="info-label">文件MD5:</td>
          <td class="info-content">{{ fileMd5 }}</td>
          <td class="info-label">文件类型:</td>
          <td class="info-content">{{ selectedFile.type || selectedFile.name.split('.').pop() }}</td>
        </tr>
        <tr>
          <td class="info-label">存储模式:</td>
          <td class="info-content" colspan="3">
            <el-tag v-if="storeType === 'aep'" type="warning" size="small">AEP存储</el-tag>
            <el-tag v-else-if="storeType === 'oss'" type="success" size="small">OSS存储</el-tag>
            <el-tag v-else-if="storeType" size="small">{{ storeType.toUpperCase() }}</el-tag>
            <el-tag v-else type="info" size="small">等待初始化</el-tag>

            <span v-if="storeType === 'aep'" class="store-type-hint ml-5">(小文件，限制50MB)</span>
            <span v-else-if="storeType === 'oss'" class="store-type-hint ml-5">(支持大文件上传)</span>
            <span v-else class="store-type-hint ml-5">(初始化后确定)</span>
          </td>
        </tr>
        <tr v-if="storeType === 'oss'">
          <td class="info-label">上传配置:</td>
          <td class="info-content" colspan="3">
            <span>分片大小: {{ formatFileSize(chunkSize) }}</span>
            <span class="ml-10">并发线程数: {{ concurrentLimit }}</span>
          </td>
        </tr>
      </table>

      <!-- 初始化提示 -->
      <el-alert v-if="!storeType && selectedFile" title="等待初始化" type="info" :closable="false" show-icon class="mb-15">
        <div slot="description">
          文件类型将在上传初始化后确定。点击"开始上传"按钮进行初始化。
        </div>
      </el-alert>

      <!-- AEP模式大小限制警告 -->
      <el-alert v-if="storeType === 'aep' && selectedFile && selectedFile.size > 50 * 1024 * 1024" title="文件大小超出限制"
        type="warning" :closable="false" show-icon class="mb-15">
        <div slot="description">
          <p>当前使用<strong>AEP存储模式</strong>，该模式下不支持上传超过50MB的文件。</p>
          <p>文件大小: <strong>{{ formatFileSize(selectedFile.size) }}</strong></p>
          <p>建议使用<strong>OSS存储模式</strong>来上传大文件。</p>
        </div>
      </el-alert>

      <span v-if="currentOperation" class="operation-status">{{ currentOperation }}</span>
      <!-- MD5计算进度块 -->
      <div class="progress-block">
        <div class="progress-title">
          <span>MD5校验进度: {{ Math.floor(md5Percentage) }}%</span>
          <!-- <span v-if="currentOperation" class="operation-status">{{ currentOperation }}</span> -->
        </div>
        <el-progress :percentage="md5Percentage"></el-progress>
      </div>

      <!-- 上传进度块 -->
      <div class="progress-block">
        <div class="progress-title">
          <span>上传进度: {{ Math.floor(uploadPercentage) }}%</span>
        </div>
        <el-progress :percentage="uploadPercentage" v-bind="getProgressStatus(uploadStatus)"></el-progress>
      </div>

      <div class="button-group">
        <el-button type="success" size="small" @click="startUpload" :disabled="isUploading || isPaused || isCalculatingMd5 || !fileMd5 || isProcessingAction ||
          (storeType === 'aep' && selectedFile && selectedFile.size > 50 * 1024 * 1024)">
          {{ isUploading ? '上传中...' : '开始上传' }}
        </el-button>
        <el-button type="warning" size="small" @click="pauseUpload"
          :disabled="!isUploading || isCalculatingMd5 || isProcessingAction">
          暂停上传
        </el-button>
        <el-button type="primary" size="small" @click="resumeUpload" :disabled="isUploading || !isPaused || isCalculatingMd5 || isProcessingAction ||
          (storeType === 'aep' && selectedFile && selectedFile.size > 50 * 1024 * 1024)">
          继续上传
        </el-button>
        <el-button type="info" size="small" @click="resetState"
          :disabled="isUploading || isCalculatingMd5 || isProcessingAction">
          重置
        </el-button>
        <el-button type="default" size="small" @click="showStoreTypeInfo" title="显示存储类型信息">
          <i class="el-icon-info"></i>
        </el-button>
      </div>
    </div>

    <!-- 操作日志 -->
    <div v-if="selectedFile" class="operation-logs">
      <div class="logs-header" @click="toggleLogs">
        <h4>操作日志</h4>
        <div class="log-actions">
          <el-button type="text" size="mini" @click.stop="clearLogs">清空</el-button>
          <i :class="['el-icon-arrow-down', { 'is-expanded': logsVisible }]"></i>
        </div>
      </div>
      <el-collapse-transition>
        <div v-show="logsVisible" class="logs-container">
          <el-scrollbar style="height: 300px;">
            <div class="log-list">
              <div v-for="(log, index) in logs" :key="index" :class="['log-item',
                {
                  'log-error': log.type === 'error',
                  'log-success': log.type === 'success',
                  'log-info': log.type === 'info',
                  'log-md5': log.isMd5Log
                }]">
                <span class="log-time">{{ log.time }}</span>
                <span class="log-content">{{ log.message }}</span>
                <span class="log-elapsed" v-if="log.elapsed">{{ log.elapsed }}</span>
                <span class="log-total-time" v-if="log.totalTime">总计: {{ log.totalTime }}</span>
              </div>
              <div v-if="logs.length === 0" class="empty-log">暂无操作日志</div>
            </div>
          </el-scrollbar>
        </div>
      </el-collapse-transition>
    </div>

    <!-- 状态提示 -->
    <el-alert v-if="message" :title="message" :type="alertType" show-icon class="status-alert"
      :closable="false"></el-alert>
  </div>
</template>

<script>
import axios from '@/api/http';
// require("@/assets/js/spark-md5.min.js")
import SparkMD5 from 'spark-md5';
import { Message } from 'element-ui';

export default {
  data() {
    return {
      selectedFile: null,       // 选中的文件对象
      fileMd5: '',             // 文件MD5值
      uploadId: '',           // 后端返回的上传ID
      fileId: '',            // 后端返回的文件ID
      uploadedChunks: [],     // 已上传的分片索引
      chunkTokens: [],        // 分片上传token令牌
      chunkSize: 20 * 1024 * 1024, // 分片大小
      isUploading: false,      // 上传状态锁
      isPaused: false,         // 是否暂停上传
      uploadPercentage: 0,    // 上传进度百分比
      message: '',            // 状态提示信息
      alertType: 'info',      // 提示类型
      uploadStatus: '',       // 进度条状态
      storeType: '',          // 文件存储类型（aep或oss）
      isCalculatingMd5: false, // 是否正在计算MD5
      currentOperation: '',   // 当前操作描述
      logs: [],               // 操作日志
      logsVisible: true,      // 操作日志是否可见
      startTime: null,        // 操作开始时间
      lastLogTime: null,      // 上一次日志记录时间
      totalTime: 0,           // 总耗时（毫秒）
      failedChunks: [],       // 失败的分片记录
      _lastLoggedPercentage: 0, // 用于记录日志的百分比
      abortControllers: [],    // 用于取消上传请求的控制器
      uploadTasks: [],         // 上传任务列表
      chunksQueue: [],         // 待上传分片队列
      isProcessingAction: false, // 是否正在处理操作（防抖用）
      concurrentLimit: 3,      // 分片上传并发数
      md5Percentage: 0,        // MD5计算进度百分比
    };
  },
  computed: {
    // 总分片数量
    totalChunks() {
      if (!this.selectedFile) return 0;
      return Math.ceil(this.selectedFile.size / this.chunkSize);
    },
    // 判断是否是小文件
    isSmallFile() {
      if (!this.selectedFile) return true;
      return this.selectedFile.size < 50 * 1024 * 1024; // 小于50MB
    },
    // 判断当前文件是否超出AEP模式大小限制
    isFileTooLargeForAep() {
      if (!this.selectedFile) return false;

      // 只有当确定是AEP模式时才返回true
      return this.storeType === "aep" && this.selectedFile.size > 50 * 1024 * 1024;

      // 移除此条件，解决初始状态下按钮被禁用的问题
      // (this.storeType === "" && !this.isSmallFile && isLargeFile)
    }
  },
  methods: {
    // 添加日志
    addLog(message, type = 'info') {
      const now = new Date();

      // 如果是新的上传操作或者是重置类型，重置计时器
      if (!this.startTime || type === 'reset') {
        this.startTime = now;
        this.lastLogTime = now;
        this.totalTime = 0;

        // 如果是reset类型，不添加日志，只重置计时器
        if (type === 'reset') {
          return;
        }
      }

      // 计算耗时
      let elapsed = 0;
      if (this.lastLogTime) {
        elapsed = now - this.lastLogTime;
      }

      // 更新总耗时（只计算info和success类型的日志）
      if (type !== 'error') {
        this.totalTime += elapsed;
      }

      // 更新上一次日志时间
      this.lastLogTime = now;

      const log = {
        time: now.toLocaleTimeString(),
        message,
        type,
        isMd5Log: message.includes('MD5'), // 添加一个标记用于识别MD5相关日志
        elapsed: this.formatTime(elapsed),
        totalTime: this.formatTime(this.totalTime)
      };

      this.logs.unshift(log);

      // 日志最多保留100条
      if (this.logs.length > 100) {
        this.logs = this.logs.slice(0, 100);
      }

      // 显示错误消息
      if (type === 'error') {
        Message.error(message);
      }
    },

    // 暂停上传
    async pauseUpload() {
      if (!this.isUploading || this.isProcessingAction) return;

      // 设置正在处理操作状态
      this.isProcessingAction = true;

      this.isPaused = true;
      this.isUploading = false;
      this.message = '上传已暂停';
      this.alertType = 'warning';
      this.currentOperation = '已暂停';

      // 取消所有正在进行的上传请求
      if (this.abortControllers && this.abortControllers.length > 0) {
        this.addLog(`正在取消 ${this.abortControllers.length} 个上传任务...`, 'warning');
        this.abortControllers.forEach(controller => {
          try {
            controller.abort();
          } catch (error) {
            console.error('取消上传请求失败:', error);
          }
        });
        // 清空控制器列表
        this.abortControllers = [];
      }

      this.addLog('上传已暂停', 'info');

      // 延迟一段时间后重置处理操作状态，确保所有操作完成
      setTimeout(() => {
        this.isProcessingAction = false;
      }, 500);
    },

    // 继续上传
    async resumeUpload() {
      if (!this.selectedFile || !this.isPaused || this.isUploading || this.isProcessingAction) return;

      // 检查aep模式下文件大小限制
      if (this.storeType === "aep" && this.selectedFile.size > 50 * 1024 * 1024) {
        this.handleError('AEP模式不支持上传超过50MB的文件，请使用OSS存储模式');
        return;
      }

      // 设置正在处理操作状态
      this.isProcessingAction = true;

      // 确保没有正在进行的任务
      if (this.abortControllers && this.abortControllers.length > 0) {
        this.addLog(`发现 ${this.abortControllers.length} 个未完成的上传任务，正在取消...`, 'warning');
        this.abortControllers.forEach(controller => {
          try {
            controller.abort();
          } catch (error) {
            console.error('取消上传请求失败:', error);
          }
        });
        // 清空控制器列表
        this.abortControllers = [];
      }

      this.isPaused = false;
      this.isUploading = true;
      this.uploadStatus = '';
      this.message = '继续上传中...';
      this.alertType = 'info';
      this.currentOperation = '继续上传中...';
      this.addLog('继续上传文件: ' + this.selectedFile.name, 'info');

      // 重置处理状态，确保可以暂停
      this.isProcessingAction = false;

      try {
        if (this.isSmallFile) {
          this.currentOperation = '小文件上传中...';
          await this.uploadSmallFile();

          console.log('[ 11111 ]-363', )
        } else {
          this.currentOperation = '分片上传中...';

          // 如果有失败的分片记录，只重试这些分片
          if (this.failedChunks && this.failedChunks.length > 0) {
            const failedChunksToRetry = [...this.failedChunks];
            this.failedChunks = []; // 清空失败记录

            // 重新初始化上传队列
            this.chunksQueue = [...failedChunksToRetry];

            this.addLog(`重试 ${failedChunksToRetry.length} 个失败的分片: ${failedChunksToRetry.join(', ')}`, 'info');

            // 执行分片上传
            await this.uploadChunks();
          } else {
            // 否则继续正常的分片上传
            await this.uploadChunks();
          }

          // 检查是否已暂停
          if (this.isPaused) return;

          // 判断是否需要合并分片
          if (this.storeType === 'oss') {
            this.currentOperation = '合并分片中...';
            await this.completeUpload();
            this.addLog('分片合并完成', 'success');
          }
          if (!this.isPaused) {
            this.handleSuccess('文件上传成功！');
          }
        }

      } catch (error) {
        this.handleError('继续上传失败: ' + error.message);
        // 错误后仍可继续尝试上传
        return;
      } finally {
        if (!this.isPaused) {
          this.isUploading = false;
          this.currentOperation = this.failedChunks && this.failedChunks.length > 0 ?
            '部分分片上传失败，可再次点击"继续上传"重试' : '';
        }
        // 此处不需要重置isProcessingAction，因为已在上面重置过
      }
    },

    // 处理文件选择
    async handleFileChange(file) {
      this.resetState();
      this.selectedFile = file.raw;

      // 初始化进度条
      this.md5Percentage = 0;
      this.uploadPercentage = 0;
      this._lastLoggedPercentage = 0;

      // 重置计时器
      this.addLog('', 'reset');

      this.addLog(`选择文件: ${file.raw.name} (${this.formatFileSize(file.raw.size)})`, 'info');

      try {
        this.isCalculatingMd5 = true;
        this.message = '正在计算文件MD5，请稍候...';
        this.alertType = 'info';
        this.currentOperation = '计算文件MD5中...';
        this.addLog('开始计算文件MD5值', 'info');

        this.fileMd5 = await this.calculateFileMD5(this.selectedFile);

        this.message = '文件校验完成，点击开始上传';
        this.alertType = 'success';
        this.currentOperation = '';
        this.uploadPercentage = 0; // MD5计算完成后重置进度为0
        this.addLog(`文件MD5计算完成: ${this.fileMd5}`, 'success');
      } catch (error) {
        this.handleError('MD5计算失败: ' + error.message);
      } finally {
        this.isCalculatingMd5 = false;
      }
    },

    // 开始上传流程
    async startUpload() {
      if (!this.selectedFile) return;

      // 检查aep模式下文件大小限制 - 初始可能没有storeType，初始化后会再检查
      if (this.storeType === "aep" && this.selectedFile.size > 50 * 1024 * 1024) {
        this.handleError('AEP模式不支持上传超过50MB的文件，请使用OSS存储模式');
        return;
      }

      this.isUploading = true;
      this.isPaused = false;
      this.uploadStatus = '';
      this.uploadPercentage = 0;
      this.message = '开始上传文件...';
      this.alertType = 'info';

      // 重置计时器
      this.addLog('', 'reset');

      this.addLog(`开始上传文件: ${this.selectedFile.name}`, 'info');

      try {
        if (this.isSmallFile) {
          // 小文件上传
          this.currentOperation = '小文件上传中...';
          this.addLog('检测为小文件，使用直接上传方式', 'info');
          await this.uploadSmallFile();
this.handleSuccess('文件上传成功！');
          console.log('[ 3333 ]-477', )
        } else {
          // 大文件分片上传
          this.addLog('检测为大文件，使用分片上传方式', 'info');

          // 1. 初始化分片上传
          this.currentOperation = '初始化分片上传...';
          this.addLog('开始初始化分片上传', 'info');
          const initResponse = await this.initChunkUpload();

          // 检查初始化是否失败
          if (initResponse.code == 1) {
            // 初始化失败，直接返回，不继续执行
            return;
          }

          // 检查是否秒传成功
          if (initResponse.code == 200) {
            this.addLog('秒传成功！文件已存在于服务器', 'success');
            this.handleSuccess('文件秒传成功！');
            return;
          }

          // 初始化完成后，确保检查AEP模式下的文件大小限制
          if (this.storeType === "aep" && this.selectedFile.size > 50 * 1024 * 1024) {
            this.addLog(`警告: AEP模式下文件(${this.formatFileSize(this.selectedFile.size)})超过50MB上限`, 'error');
            this.handleError('AEP模式不支持上传超过50MB的文件，请使用OSS存储模式');
            return;
          }

          this.addLog(`初始化成功，存储类型: ${this.storeType}, 共${this.totalChunks}个分片`, 'success');

          // 2. 执行分片上传
          this.currentOperation = '分片上传中...';
          await this.uploadChunks();

          // 检查是否已暂停
          if (this.isPaused) return;

          // 3. 如果是oss存储，需要合并分片
          if (this.storeType == "oss") {
            this.currentOperation = '合并分片中...';
            this.addLog('开始合并分片', 'info');
            await this.completeUpload();
            this.addLog('分片合并完成', 'success');
          }
          if (!this.isPaused) {
            this.handleSuccess('文件上传成功！');
          }
        }

      } catch (error) {
        this.handleError('上传失败: ' + error.message);
      } finally {
        if (!this.isPaused) {
          this.isUploading = false;
          this.currentOperation = '';
        }
      }
    },

    // 小文件上传
    async uploadSmallFile() {

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('fileMd5', this.fileMd5);
      formData.append('fileSize', this.selectedFile.size);

      try {
        this.addLog('【小文件上传】开始上传', 'info');
        console.log('【小文件上传】发送请求:', {
          url: '/procAttachment/upfile',
          file: this.selectedFile.name,
          fileMd5: this.fileMd5,
          fileSize: this.selectedFile.size
        });

        // 创建AbortController实例用于取消请求
        const abortController = new AbortController();
        this.abortControllers.push(abortController);

        const response = await axios.post('/procAttachment/upfile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            if (this.isPaused) return;

            // 更精确的进度计算，保留两位小数
            const percentage = Math.min(Math.round((progressEvent.loaded * 100) / progressEvent.total), 99.99);
            this.uploadPercentage = percentage;
            const currentWholePercentage = Math.floor(percentage);

            // 更新当前操作文本
            this.currentOperation = `上传进度: ${currentWholePercentage}%`;

            // 移除每10%记录一次的限制，改为每次进度变化都记录
            if (currentWholePercentage > this._lastLoggedPercentage) {
              this.addLog(`上传进度: ${currentWholePercentage}%`, 'info');
              this._lastLoggedPercentage = currentWholePercentage;
            }
          },
          signal: abortController.signal
        });

        // 请求完成后从控制器列表中移除
        const controllerIndex = this.abortControllers.indexOf(abortController);
        if (controllerIndex !== -1) {
          this.abortControllers.splice(controllerIndex, 1);
        }

        // 适配封装后的http
        const responseData = response;

        console.log('【小文件上传】响应结果:', JSON.stringify(responseData));

        // 错误处理：检查响应是否存在
        if (!responseData) {
          const errorMsg = '小文件上传失败: 服务器未返回响应';
          this.addLog(errorMsg, 'error');
          this.message = errorMsg;
          this.alertType = 'error';
          this.uploadStatus = 'exception';
          return;
        }

        // 错误处理：检查响应code
        if (responseData.data.code === 1 || responseData.data.code === "1") {
          const errorMsg = responseData.data.msg || '小文件上传失败: 服务器返回错误';
          this.addLog(errorMsg, 'error');
          this.handleError('上传失败: ' + errorMsg);
          this.message = errorMsg;
          this.alertType = 'error';
          this.uploadStatus = 'exception';
          return;
        }

        // 上传完成，设置为100%
        this.uploadPercentage = 100;
        this.currentOperation = '上传完成: 100%';
        this.addLog('上传进度: 100%', 'success');
        this.addLog('【小文件上传】上传成功', 'success');

        // 添加数据结构安全检查 - 以多种可能的路径提取fileId
        let fileId = null;

        // 检查结构：responseData.data.fileId
        if (responseData && responseData.data && responseData.data.fileId) {
          fileId = responseData.data.fileId;
          this.addLog(`获取文件ID: ${fileId}`, 'success');
        }
        // 检查结构：responseData.data.data.fileId (嵌套数据)
        else if (responseData && responseData.data && responseData.data.data && responseData.data.data.fileId) {
          fileId = responseData.data.data.fileId;
          this.addLog(`从嵌套数据结构中获取文件ID: ${fileId}`, 'info');
        }
        // 检查结构：responseData.fileId (根级别)
        else if (responseData && responseData.fileId) {
          fileId = responseData.fileId;
          this.addLog(`从响应根级别获取文件ID: ${fileId}`, 'info');
        }
        // 检查结构：responseData中的其他字段
        else {
          this.addLog('警告: 服务器响应中未找到fileId字段', 'warning');
          console.warn('【小文件上传】响应数据中缺少fileId:', responseData);

          // 尝试在整个对象中查找包含fileId的键
          const findFileIdInObject = (obj, path = '') => {
            if (!obj || typeof obj !== 'object') return null;

            for (const key in obj) {
              const currentPath = path ? `${path}.${key}` : key;
              if (key === 'fileId' && obj[key]) {
                this.addLog(`在路径 ${currentPath} 中找到fileId`, 'info');
                return obj[key];
              } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                const found = findFileIdInObject(obj[key], currentPath);
                if (found) return found;
              }
            }
            return null;
          };

          fileId = findFileIdInObject(responseData);
        }

        // 设置fileId (如果找到)
        if (fileId) {
          this.fileId = fileId;
        } else {
          // 如果无法获取fileId，记录警告但继续执行
          this.addLog('警告: 无法从响应中提取fileId，后续操作可能受影响', 'warning');
        }

        // 返回响应数据

        console.log('[ responseData ]-670', responseData)
        return responseData.data || responseData;
      } catch (error) {
        // 判断是否是因为取消请求导致的错误
        if (error.name === 'AbortError' || (error.message && error.message.includes('canceled'))) {
          this.addLog('上传已取消', 'warning');
          return;
        }

        console.error('【小文件上传】上传失败', error);
        const errorMessage = error.response
          ? `上传失败: 服务器返回 ${error.response.status} - ${error.response.statusText || '未知错误'}`
          : `上传失败: ${error.message || '网络错误，请检查连接'}`;

        this.addLog(errorMessage, 'error');
        this.message = errorMessage;
        this.alertType = 'error';
        this.uploadStatus = 'exception';

        if (error.response && error.response.data) {
          console.error('服务器错误详情:', error.response.data);
          this.addLog(`服务器错误详情: ${JSON.stringify(error.response.data)}`, 'error');
        }
      }

    },

    // 初始化分片上传
    async initChunkUpload() {
      const formData = new FormData();

      // 获取第一个分片
      const firstChunkFile = this.getChunk(0);
      formData.append('firstChunkFile', firstChunkFile);
      formData.append('filename', this.selectedFile.name);
      formData.append('fileMd5', this.fileMd5);
      formData.append('partCount', this.totalChunks);
      formData.append('fileSize', this.selectedFile.size);
      formData.append('partSize', this.chunkSize);
      // 可选参数
      const fileType = this.selectedFile.name.split('.').pop();
      if (fileType) {
        formData.append('fileType', fileType);
      }
      if (this.selectedFile.type) {
        formData.append('fileContentType', this.selectedFile.type);
      }

      console.log('【初始化分片上传】发送请求:', {
        url: '/procAttachment/initUploadChunk',
        filename: this.selectedFile.name,
        fileMd5: this.fileMd5,
        partCount: this.totalChunks,
        fileSize: this.selectedFile.size,
        fileType: fileType,
        fileContentType: this.selectedFile.type
      });

      try {
        const response = await axios.post('/procAttachment/initUploadChunk', formData);
        // 由于封装了http，响应数据结构有变化
        const responseData = response.data;

        console.log('【初始化分片上传】响应结果:', responseData);

        // 校验返回的code值
        if (responseData && responseData.code == "1") {
          const errorMsg = responseData.msg || '初始化分片上传失败: 服务器返回错误';
          this.addLog(errorMsg, 'error');
          this.message = errorMsg;
          this.alertType = 'error';
          this.uploadStatus = 'exception';
          return { code: 1 }; // 返回错误code，中断后续操作
        }

        // 从data字段获取具体数据
        const data = responseData.data || {};
        // 保存返回的重要信息
        this.storeType = data.storeType || '';
        this.uploadId = data.uploadId || '';
        this.fileId = data.fileId || '';
        this.uploadedChunks = data.uploadedChunks || [];
        this.chunkTokens = data.chunkTokens || {}; // 注意：这是一个对象，不是数组

        // 记录并显示存储类型信息
        console.log('存储类型已设置:', this.storeType);
        this.addLog(`服务器返回存储类型: ${this.storeType || '未指定'}`, 'info');

        // 添加调试日志，输出存储类型和文件大小信息
        console.log('【初始化分片上传】存储类型和文件大小:', {
          storeType: this.storeType,
          fileSize: this.selectedFile.size,
          fileSizeMB: Math.round(this.selectedFile.size / (1024 * 1024) * 100) / 100,
          isLargeFile: this.selectedFile.size > 50 * 1024 * 1024
        });

        // 如果是AEP模式且文件大小超过50MB，记录警告
        if (this.storeType === "aep" && this.selectedFile.size > 50 * 1024 * 1024) {
          this.addLog(`警告: 检测到AEP模式，文件大小(${this.formatFileSize(this.selectedFile.size)})超过50MB限制`, 'error');
        }

        if (data.code == 200) {
          this.addLog('文件已存在，秒传成功', 'success');
        } else if (data.code == 304) {
          if (this.uploadedChunks.length > 0) {
            this.addLog(`恢复上传: 已上传${this.uploadedChunks.length}个分片，剩余${this.totalChunks - this.uploadedChunks.length}个分片`, 'info');
          } else {
            this.addLog('文件不存在，开始上传所有分片', 'info');
          }
        }

        return data;
      } catch (error) {
        console.error('【初始化分片上传】请求失败:', error);
        const errorMsg = '初始化分片上传失败: ' + error.message;
        this.addLog(errorMsg, 'error');
        this.message = errorMsg;
        this.alertType = 'error';
        this.uploadStatus = 'exception';
        return { code: 1 }; // 返回错误code，中断后续操作
      }
    },

    // 执行分片上传
    async uploadChunks() {
      // 如果是aep存储类型，检查文件大小限制
      if (this.storeType === "aep") {
        console.log('【uploadChunks】检测到AEP存储类型，检查文件大小:', {
          fileSize: this.selectedFile.size,
          fileSizeMB: Math.round(this.selectedFile.size / (1024 * 1024) * 100) / 100,
          isLargeFile: this.selectedFile.size > 50 * 1024 * 1024
        });

        // 再次检查文件大小，确保不会上传过大的文件
        if (this.selectedFile.size > 50 * 1024 * 1024) {
          this.addLog(`AEP模式不支持上传超过50MB的文件，当前文件大小: ${this.formatFileSize(this.selectedFile.size)}`, 'error');
          this.handleError('AEP模式不支持上传超过50MB的文件，请使用OSS存储模式');
          this.isUploading = false;
          return;
        }

        this.addLog('检测到AEP存储类型，直接上传整个文件', 'info');
        await this.uploadEntireFileForAep();
        return;
      }

      // oss存储类型，执行分片上传
      const totalChunks = this.totalChunks;

      // 如果没有待上传队列，则初始化队列
      if (!this.chunksQueue || this.chunksQueue.length === 0) {
        // 初始化时已上传第一个分片（索引为1），从2开始上传后续分片
        this.chunksQueue = Array.from({ length: totalChunks })
          .map((_, index) => index + 1) // 从1开始
          .filter(index => !this.uploadedChunks.includes(index));
      }

      // 如果没有分片需要上传，直接返回完成
      if (this.chunksQueue.length === 0) {
        this.addLog('所有分片已上传完成', 'success');
        return;
      }

      this.addLog(`开始上传分片，共${totalChunks}个分片，已上传${this.uploadedChunks.length}个，待上传${this.chunksQueue.length}个分片`, 'info');

      // 并行上传（限制并发数）
      let failedChunks = [];
      this.uploadTasks = [];

      try {
        while (this.chunksQueue.length > 0 && !this.isPaused) {
          // 检查是否已暂停
          if (this.isPaused) {
            this.addLog('上传已暂停，停止上传分片', 'info');
            break;
          }

          // 获取当前批次要上传的分片
          const chunkGroup = this.chunksQueue.splice(0, Math.min(this.concurrentLimit, this.chunksQueue.length));
          this.addLog(`并行上传分片: ${chunkGroup.join(', ')}`, 'info');
          this.currentOperation = `上传分片 ${chunkGroup[0]}-${chunkGroup[chunkGroup.length - 1]}/${totalChunks}`;

          // 并行上传一组分片，单独处理每个分片的成功或失败
          const uploadPromises = chunkGroup.map(async (index) => {
            try {
              await this.uploadChunk(index);
              return { status: 'fulfilled', index };
            } catch (error) {
              // 判断是否是因为取消请求导致的错误
              if (error.name === 'AbortError' || error.message.includes('canceled')) {
                // 如果是取消的，将分片放回队列
                if (!this.chunksQueue.includes(index)) {
                  this.chunksQueue.push(index);
                }
                return { status: 'canceled', index };
              }

              failedChunks.push(index);
              this.addLog(`分片 ${index} 上传失败: ${error.message}`, 'error');
              return { status: 'rejected', index, reason: error.message };
            }
          });

          this.uploadTasks.push(...uploadPromises);

          // 等待所有分片上传完成
          const results = await Promise.all(uploadPromises);

          // 检查结果
          const canceledCount = results.filter(r => r.status === 'canceled').length;
          const failedCount = results.filter(r => r.status === 'rejected').length;
          const successCount = results.filter(r => r.status === 'fulfilled').length;

          if (canceledCount > 0) {
            this.addLog(`${canceledCount} 个分片上传已取消`, 'warning');
          }

          if (failedCount > 0) {
            this.addLog(`${failedCount} 个分片上传失败`, 'error');
          }

          if (successCount > 0) {
            this.addLog(`${successCount} 个分片上传成功`, 'success');
          }

          // 如果所有分片都被取消，则跳出循环
          if (canceledCount === chunkGroup.length) {
            break;
          }
        }

        // 处理失败的分片
        if (failedChunks.length > 0) {
          this.addLog(`${failedChunks.length} 个分片上传失败，您可以点击"继续上传"重试`, 'error');
          // 存储失败的分片，以便继续上传时使用
          this.failedChunks = failedChunks;
          throw new Error(`有 ${failedChunks.length} 个分片上传失败`);
        }

        if (!this.isPaused) {
          this.addLog('所有分片上传完成', 'success');
        }
      } catch (error) {
        // 设置错误状态，但保持已上传的分片信息
        this.uploadStatus = 'exception';
        this.isUploading = false;
        this.currentOperation = '上传部分失败，可点击"继续上传"重试';
        throw error;
      } finally {
        // 清空任务列表
        this.uploadTasks = [];
      }
    },

    // aep存储类型，上传整个文件
    async uploadEntireFileForAep() {
      // 强制检查文件大小限制 (不管上层检查是否执行)
      if (this.selectedFile.size > 50 * 1024 * 1024) {
        const errorMsg = 'AEP模式不支持上传超过50MB的文件，请使用OSS存储模式';
        this.addLog(errorMsg, 'error');
        this.message = errorMsg;
        this.alertType = 'error';
        this.uploadStatus = 'exception';
        this.isUploading = false;
        return;
      }

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('fileMd5', this.fileMd5);
      formData.append('chunkNumber', 1); // 对于aep，只有一个块

      console.log('【AEP整文件上传】发送请求:', {
        url: '/procAttachment/uploadChunk',
        fileMd5: this.fileMd5,
        chunkNumber: 1,
        fileSize: this.selectedFile.size
      });

      this.addLog('开始AEP整文件上传，这可能需要一些时间...', 'info');

      try {
        // 记录上次更新进度的时间和值，用于控制日志输出频率
        let lastLogTime = Date.now();
        let lastLoggedPercentage = 0;

        // 创建AbortController实例
        const abortController = new AbortController();
        this.abortControllers.push(abortController);

        const response = await axios.post('/procAttachment/uploadChunk', formData, {
          onUploadProgress: progress => {
            // 检查是否已暂停
            if (this.isPaused) return;

            // 更精确的进度计算，保留两位小数
            const percentage = Math.min((progress.loaded / progress.total) * 100, 99.99);
            this.uploadPercentage = Math.floor(percentage);

            const now = Date.now();
            const currentWholePercentage = Math.floor(this.uploadPercentage);

            // 每整数百分比变化或每3秒记录一次日志
            if (
              (currentWholePercentage > lastLoggedPercentage) ||
              (now - lastLogTime > 3000)
            ) {
              this.addLog(`上传进度: ${this.uploadPercentage}%`, 'info');
              lastLoggedPercentage = currentWholePercentage;
              lastLogTime = now;
            }

            // 更新当前操作文本
            this.currentOperation = `上传中... ${this.uploadPercentage}%`;
          },
          signal: abortController.signal // 添加signal用于取消请求
        });

        // 请求完成后从控制器列表中移除
        const controllerIndex = this.abortControllers.indexOf(abortController);
        if (controllerIndex !== -1) {
          this.abortControllers.splice(controllerIndex, 1);
        }

        // 适配封装后的http
        const responseData = response.data;

        console.log('【AEP整文件上传】响应结果:', responseData);

        // 校验返回的code值
        if (responseData && responseData.code == "1") {
          const errorMsg = responseData.msg || 'AEP文件上传失败: 服务器返回错误';
          this.addLog(errorMsg, 'error');
          this.message = errorMsg;
          this.alertType = 'error';
          this.uploadStatus = 'exception';
          throw new Error(errorMsg);
        }

        // 从响应中获取fileId
        if (responseData.data && responseData.data.fileId) {
          this.fileId = responseData.data.fileId;
          this.addLog(`获取到文件ID: ${this.fileId}`, 'success');
        } else {
          this.addLog('警告: 响应中未包含fileId', 'warning');
        }

        // 上传完成，设置为100%
        this.uploadPercentage = 100;
        this.currentOperation = '上传完成: 100%';
        this.addLog('上传进度: 100%', 'success');
        this.addLog('AEP整文件上传成功', 'success');
      } catch (error) {
        // 判断是否是因为取消请求导致的错误
        if (error.name === 'AbortError' || error.message.includes('canceled')) {
          console.log('【AEP整文件上传】上传已取消');
          this.addLog('上传已取消', 'warning');
          return;
        }

        console.error('【AEP整文件上传】请求失败:', error);
        const errorMsg = 'AEP整文件上传失败: ' + error.message;
        this.addLog(errorMsg, 'error');
        this.message = errorMsg;
        this.alertType = 'error';
        this.uploadStatus = 'exception';
        throw error;
      }
    },

    // 上传单个分片
    async uploadChunk(chunkNumber) {
      // chunkNumber已经是从1开始的索引
      const chunkIndex = chunkNumber - 1; // 用于获取实际文件片段
      const formData = new FormData();
      const chunk = this.getChunk(chunkIndex);
      formData.append('file', chunk);
      formData.append('chunkNumber', chunkNumber);
      formData.append('fileMd5', this.fileMd5);
      formData.append('uploadId', this.uploadId);
      formData.append('fileId', this.fileId);
      // 查找对应的chunkToken
      const token = this.chunkTokens[chunkNumber];
      if (token) {
        formData.append('chunkToken', token);
      }

      // 带进度监听
      console.log(`【分片上传】发送请求 - 分片${chunkNumber}/${this.totalChunks}:`, {
        url: '/procAttachment/uploadChunk',
        fileMd5: this.fileMd5,
        uploadId: this.uploadId,
        chunkNumber: chunkNumber,
        chunkSize: chunk.size,
        fileId: this.fileId
      });

      try {
        // 创建AbortController实例
        const abortController = new AbortController();
        this.abortControllers.push(abortController);

        const response = await axios.post('/procAttachment/uploadChunk', formData, {
          onUploadProgress: progress => {
            // 检查是否已暂停
            if (this.isPaused) return;
            this.updateProgress(chunkIndex, progress.loaded);
          },
          signal: abortController.signal // 添加signal用于取消请求
        });

        // 请求完成后从控制器列表中移除
        const controllerIndex = this.abortControllers.indexOf(abortController);
        if (controllerIndex !== -1) {
          this.abortControllers.splice(controllerIndex, 1);
        }

        // 适配封装后的http
        const responseData = response.data;

        console.log(`【分片上传】响应结果 - 分片${chunkNumber}/${this.totalChunks}:`, responseData);

        // 校验返回的code值
        if (responseData && responseData.code == "1") {
          const errorMsg = responseData.msg || `分片${chunkNumber}上传失败: 服务器返回错误`;
          this.addLog(errorMsg, 'error');
          throw new Error(errorMsg);
        }

        // 将已上传的分片索引添加到数组中
        if (!this.uploadedChunks.includes(chunkNumber)) {
          this.uploadedChunks.push(chunkNumber);
          this.addLog(`分片 ${chunkNumber}/${this.totalChunks} 上传成功`, 'success');
        }
      } catch (error) {
        // 判断是否是因为取消请求导致的错误
        if (error.name === 'AbortError' || error.message.includes('canceled')) {
          console.log(`【分片上传】分片${chunkNumber}上传已取消`);
          this.addLog(`分片 ${chunkNumber} 上传已取消`, 'warning');
          throw error; // 仍然抛出错误，但在上层处理时会区分取消和失败
        }

        console.error(`【分片上传】分片${chunkNumber}上传失败:`, error);
        const errorMsg = `分片 ${chunkNumber}/${this.totalChunks} 上传失败: ${error.message}`;
        this.addLog(errorMsg, 'error');
        throw error;
      }
    },

    // 完成上传接口(仅oss存储需要)
    async completeUpload() {
      console.log('【完成分片上传】发送请求:', {
        url: '/procAttachment/completeChunk',
        fileMd5: this.fileMd5,
        uploadId: this.uploadId,
        fileId: this.fileId
      });

      try {
        const formData = new FormData();
        formData.append('fileMd5', this.fileMd5);
        formData.append('uploadId', this.uploadId);
        formData.append('fileId', this.fileId);

        const response = await axios.post('/procAttachment/completeChunk', formData);

        // 适配封装后的http
        const responseData = response.data;

        console.log('【完成分片上传】响应结果:', responseData);

        // 校验返回的code值
        if (responseData && responseData.code == "1") {
          const errorMsg = responseData.msg || '完成分片上传失败: 服务器返回错误';
          this.addLog(errorMsg, 'error');
          this.message = errorMsg;
          this.alertType = 'error';
          this.uploadStatus = 'exception';
          throw new Error(errorMsg);
        }

        this.addLog('分片合并完成', 'success');
      } catch (error) {
        console.error('【完成分片上传】请求失败:', error);
        const errorMsg = '完成分片上传失败: ' + error.message;
        this.addLog(errorMsg, 'error');
        this.message = errorMsg;
        this.alertType = 'error';
        this.uploadStatus = 'exception';
        throw error;
      }
    },

    // 获取文件分片
    getChunk(chunkIndex) {
      const start = chunkIndex * this.chunkSize;
      const end = Math.min(start + this.chunkSize, this.selectedFile.size);
      return this.selectedFile.slice(start, end);
    },

    // 计算文件MD5（使用Web Worker优化）
    calculateFileMD5(file) {

      return new Promise((resolve, reject) => {
        // 重置MD5计算进度
        this.md5Percentage = 0;
        const spark = new SparkMD5.ArrayBuffer();
        const reader = new FileReader();
        const chunkSize = 2 * 1024 * 1024; // 2MB切片计算
        let currentChunk = 0;
        const totalChunks = Math.ceil(file.size / chunkSize);

        // 记录上次更新进度的时间和百分比值，用于控制日志输出频率
        let lastLogTime = Date.now();
        let lastLoggedPercentage = 0;

        reader.onload = e => {

          console.log('[ e......... ]-1184', e)
          spark.append(e.target.result);
          currentChunk++;

          // 更新MD5计算进度，保留两位小数
          const percentage = Math.min(Math.round((currentChunk / totalChunks) * 100), 99.99);
          this.md5Percentage = percentage; // 使用md5Percentage替代uploadPercentage

          const now = Date.now();
          const currentWholePercentage = Math.floor(percentage);

          // 更新日志的条件：
          // 1. 每5%进度变化记录一次
          // 2. 或每3秒记录一次（无论进度变化多少）
          // 3. 或达到重要节点时（25%, 50%, 75%, 90%, 99%）
          const importantMilestones = [25, 50, 75, 90, 99];

          if (
            (currentWholePercentage - lastLoggedPercentage >= 5) || // 每5%记录一次
            (now - lastLogTime > 3000) || // 每3秒至少记录一次
            (importantMilestones.includes(currentWholePercentage) && currentWholePercentage > lastLoggedPercentage) // 重要节点
          ) {
            this.addLog(`MD5计算进度: ${currentWholePercentage}%`, 'info');
            lastLoggedPercentage = currentWholePercentage;
            lastLogTime = now;
          }

          // 更新当前操作文本
          this.currentOperation = `MD5计算中... ${currentWholePercentage}%`;

          if (currentChunk * chunkSize < file.size) {
            loadNext();
          } else {
            // MD5计算完成时，将MD5进度设为100%
            this.md5Percentage = 100;

            console.log('[ spark.end() ]-1218', spark.end())
            resolve(spark.end());
          }
        };

        reader.onerror = e => {
          const errorMsg = '文件读取失败: ' + e.target.error.message;
          this.addLog(errorMsg, 'error');
          reject(new Error(errorMsg));
        };

        const loadNext = () => {
          const start = currentChunk * chunkSize;
          const end = Math.min(start + chunkSize, file.size);
          reader.readAsArrayBuffer(file.slice(start, end));
        };

        loadNext();
      });
    },

    // 更新进度条
    updateProgress(chunkIndex, loaded) {
      // 精确计算每个分片的进度贡献
      const chunkSize = this.getChunkSize(chunkIndex);
      const chunkProgress = (loaded / chunkSize) * 100;

      // 计算已完成分片的总进度贡献
      const completedChunksContribution = (this.uploadedChunks.length / this.totalChunks) * 100;

      // 计算当前正在上传分片的进度贡献
      const currentChunkContribution = (chunkProgress / this.totalChunks);

      // 计算总进度，保留两位小数
      const totalProgress = Math.min(
        parseFloat((completedChunksContribution + currentChunkContribution).toFixed(2)),
        99.99 // 保留最后0.01%用于合并操作
      );

      this.uploadPercentage = Math.floor(totalProgress);

      // 更新当前操作文本以显示进度
      this.currentOperation = `上传分片 ${chunkIndex + 1}/${this.totalChunks}，总进度: ${Math.floor(totalProgress)}%`;

      // 整数百分比变化时记录日志，无需等待10%的变化
      const wholePercentage = Math.floor(totalProgress);
      if (wholePercentage > this._lastLoggedPercentage) {
        this.addLog(`上传进度: ${wholePercentage}%`, 'info');
        this._lastLoggedPercentage = wholePercentage;
      }
    },

    // 获取特定分片的大小（最后一个分片可能比其他分片小）
    getChunkSize(chunkIndex) {
      if (!this.selectedFile) return this.chunkSize;

      if (chunkIndex === this.totalChunks - 1) {
        const lastChunkSize = this.selectedFile.size % this.chunkSize;
        return lastChunkSize === 0 ? this.chunkSize : lastChunkSize;
      }

      return this.chunkSize;
    },

    // 错误处理
    handleError(message) {
      this.message = message;
      this.alertType = 'error';
      this.uploadStatus = 'exception';
      this.addLog(message, 'error');

      // 如果是上传过程中的错误，给出提示
      if (this.isUploading && !this.isSmallFile) {
        this.isUploading = false;
        this.addLog('您可以点击"继续上传"按钮从失败处继续', 'info');
      }
    },

    // 成功处理
    handleSuccess(message) {

      console.log('[ 我成功处理拉!!! ]-1301', message)
      this.message = message;
      this.alertType = 'success';
      this.uploadPercentage = 100;
      this.uploadStatus = 'success';
      this.addLog(message, 'success');

      // 触发上传成功事件
      this.$emit('upload-success', {
        fileId: this.fileId,
        fileMd5: this.fileMd5,
        filename: this.selectedFile.name,
        fileSize: this.selectedFile.size,
        fileType: this.selectedFile.name.split('.').pop(),
        uploadTime: new Date().toISOString()
      });
    },

    // 重置状态
    resetState() {
      // 如果正在处理其他操作，不允许重置
      if (this.isProcessingAction) return;

      this.isProcessingAction = true;

      this.uploadPercentage = 0;
      this.md5Percentage = 0; // 重置MD5进度条
      this.message = '';
      this.alertType = 'info';
      this.uploadStatus = '';
      this.uploadId = '';
      this.fileId = '';
      this.uploadedChunks = [];
      this.chunkTokens = [];
      this.storeType = '';
      this.isPaused = false;
      this.currentOperation = '';
      this.failedChunks = []; // 清空失败的分片记录

      // 取消所有正在进行的请求
      if (this.abortControllers && this.abortControllers.length > 0) {
        this.abortControllers.forEach(controller => {
          try {
            controller.abort();
          } catch (error) {
            console.error('取消请求失败:', error);
          }
        });
        this.abortControllers = [];
      }

      // 清空任务队列
      this.uploadTasks = [];
      this.chunksQueue = [];

      // 重置计时器相关变量
      this.startTime = null;
      this.lastLogTime = null;
      this.totalTime = 0;
      this._lastLoggedPercentage = 0;

      // 如果已选文件，则添加日志
      if (this.selectedFile) {
        // 重置计时器
        this.addLog('', 'reset');
        this.addLog('已重置上传状态', 'info');
      }

      this.isProcessingAction = false;
    },

    // 格式化文件大小
    formatFileSize(bytes) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    // 切换日志面板显示/隐藏
    toggleLogs(event) {
      // 如果点击的是清空按钮，不切换显示状态
      if (event.target.closest('.el-button')) return;
      this.logsVisible = !this.logsVisible;
    },

    // 在清空按钮点击处理方法
    clearLogs() {
      this.logs = [];
      // 重置计时器
      this.addLog('', 'reset');
      this.addLog('已清空日志', 'info');
    },

    // 格式化时间显示
    formatTime(milliseconds) {
      if (milliseconds < 1000) {
        return milliseconds > 0 ? `${milliseconds}毫秒` : '';
      } else if (milliseconds < 60000) {
        return `${(milliseconds / 1000).toFixed(2)}秒`;
      } else {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = ((milliseconds % 60000) / 1000).toFixed(2);
        return `${minutes}分${seconds}秒`;
      }
    },

    // 获取进度条状态
    getProgressStatus(status) {
      if (status === 'success') {
        return { status: 'success' };
      } else if (status === 'exception') {
        return { status: 'exception' };
      } else if (status === 'warning') {
        return { status: 'warning' };
      } else {
        return {};
      }
    },

    // 格式化存储模式显示
    formatStoreType(storeType) {
      if (!storeType) return '未知';

      switch (storeType.toLowerCase()) {
        case 'aep':
          return 'AEP存储 (50MB限制)';
        case 'oss':
          return 'OSS存储 (支持大文件)';
        default:
          return storeType.toUpperCase();
      }
    },

    // 显示存储类型信息(调试用)
    showStoreTypeInfo() {
      const info = {
        storeType: this.storeType || '未设置',
        isFileTooLargeForAep: this.isFileTooLargeForAep,
        fileSize: this.selectedFile ? this.formatFileSize(this.selectedFile.size) : '无文件',
        isSmallFile: this.isSmallFile
      };

      console.log('当前存储类型信息:', info);
      this.addLog(`当前存储类型: ${this.storeType || '未设置'}`, 'info');

      // 提示用户
      this.$message({
        message: `当前存储类型: ${this.storeType || '未设置'}`,
        type: this.storeType ? 'success' : 'info'
      });
    },
  }
};
</script>
<style scoped>
.upload-container {
  /* max-width: 90%; */
  /* margin: 20px; */
  padding: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.upload-status {
  margin-top: 20px;
}

.status-alert {
  margin-top: 15px;
}

.button-group {
  margin: 15px 0;
  display: flex;
  gap: 10px;
}

.progress-block {
  margin: 20px 0;
}

.progress-title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  min-height: 24px;
  /* 添加最小高度确保空间稳定 */
}

/* 简单配置区域样式 */
.simple-config {
  margin: 15px 0;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.config-row {
  display: flex;
  align-items: center;
}

.config-row label {
  margin-right: 8px;
  color: #606266;
  font-size: 14px;
}

.operation-status {
  color: #606266;
  font-size: 14px;
  white-space: nowrap;
  /* 防止换行 */
  max-width: 50%;
  /* 限制最大宽度，避免挤占左侧空间 */
  overflow: hidden;
  text-overflow: ellipsis;
  /* 文本过长时显示省略号 */
}

.operation-logs {
  margin-top: 20px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 10px;
}

.store-type-hint {
  color: #909399;
  font-size: 12px;
}

.el-descriptions-item__content .el-tag {
  margin-right: 5px;
  font-weight: bold;
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
  /* 确保父容器有固定高度 */
  height: 200px;
  overflow: hidden;
}

.log-list {
  text-align: left;
  padding-right: 10px;
  /* 为滚动条预留空间 */
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

/* MD5校验相关日志样式 */
.log-md5 {
  background-color: #ecf5ff;
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
  /* 限制宽度，避免挤压其他元素 */
}

.log-elapsed {
  color: #e6a23c;
  font-size: 12px;
  margin-right: 10px;
  white-space: nowrap;
}

.log-total-time {
  color: #409EFF;
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
  color: #409EFF;
}

.empty-log {
  color: #909399;
  font-style: italic;
  text-align: center;
  padding: 20px;
}

.mb-15 {
  margin-bottom: 15px;
}

.ml-10 {
  margin-left: 10px;
}

.ml-5 {
  margin-left: 5px;
}

/* 强制el-scrollbar组件高度 */
::v-deep .el-scrollbar {
  height: 200px !important;
}

::v-deep .el-scrollbar__wrap {
  overflow-x: hidden;
}

.storage-mode-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.storage-mode-label {
  font-weight: bold;
}

.storage-mode-value {
  color: #606266;
  font-size: 14px;
}

.storage-mode-aep {
  color: #e6a23c;
}

.storage-mode-oss {
  color: #67c23a;
}

.storage-mode-unknown {
  color: #909399;
}

/* 文件信息表格样式 */
.file-info-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #EBEEF5;
  font-size: 14px;
}

.file-info-table td {
  padding: 8px 10px;
  border: 1px solid #EBEEF5;
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
  width: 35%;
}

/* 为低版本Element UI添加el-descriptions样式 - 使用样式穿透 */
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

::v-deep .el-descriptions__body .el-descriptions__table .el-descriptions-item__cell {
  box-sizing: border-box;
  text-align: left;
  font-weight: 400;
  line-height: 1.5;
  padding: 12px 10px;
}

::v-deep .el-descriptions__body .el-descriptions__table .el-descriptions-item__label {
  color: #909399;
  font-weight: bold;
  min-width: 50px;
}

::v-deep .el-descriptions.is-bordered .el-descriptions__body .el-descriptions__table {
  border: 1px solid #EBEEF5;
}

::v-deep .el-descriptions.is-bordered .el-descriptions__body .el-descriptions__table .el-descriptions-item__cell {
  border-right: 1px solid #EBEEF5;
  border-bottom: 1px solid #EBEEF5;
}

/* 处理最后一列的右边框 */
::v-deep .el-descriptions.is-bordered .el-descriptions__body .el-descriptions__table .el-descriptions-item__cell:last-child {
  border-right: none;
}

/* 处理最后一行的底部边框 */
::v-deep .el-descriptions.is-bordered .el-descriptions__body .el-descriptions__table tr:last-child .el-descriptions-item__cell {
  border-bottom: none;
}

/* 保证label和content在垂直方向上对齐 */
::v-deep .el-descriptions__body .el-descriptions__table .el-descriptions-item__label,
::v-deep .el-descriptions__body .el-descriptions__table .el-descriptions-item__content {
  vertical-align: middle;
}

/* 内容区域样式 */
::v-deep .el-descriptions__body .el-descriptions__table .el-descriptions-item__content {
  word-break: break-word;
}

::v-deep .el-descriptions.el-descriptions--small .el-descriptions__body .el-descriptions__table .el-descriptions-item__cell {
  padding: 8px 10px;
}

::v-deep .el-descriptions.el-descriptions--large .el-descriptions__body .el-descriptions__table .el-descriptions-item__cell {
  padding: 16px 12px;
}

/* 响应式布局支持 */
@media (max-width: 768px) {
  ::v-deep .el-descriptions__body .el-descriptions__table {
    display: flex;
    flex-direction: column;
  }

  ::v-deep .el-descriptions__body .el-descriptions__table tr {
    display: flex;
    flex-direction: column;
  }

  ::v-deep .el-descriptions__body .el-descriptions__table .el-descriptions-item__cell {
    padding: 10px;
  }
}

::v-deep .el-descriptions__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

::v-deep .el-descriptions__title {
  font-weight: bold;
  font-size: 16px;
  color: #303133;
}

::v-deep .el-descriptions-item {
  vertical-align: top;
}

/* 支持不同布局的描述列表 */
::v-deep .el-descriptions .is-vertical .el-descriptions-item__label {
  padding-bottom: 6px;
}

::v-deep .el-descriptions .is-vertical .el-descriptions-item__cell {
  display: block;
}

/* 基础表格样式兜底，确保至少有基本的表格布局 */
::v-deep .el-descriptions table {
  width: 100%;
  border-collapse: collapse;
}

::v-deep .el-descriptions table td,
::v-deep .el-descriptions table th {
  padding: 8px 10px;
  text-align: left;
}

::v-deep .el-descriptions.is-bordered table,
::v-deep .el-descriptions.is-bordered table td,
::v-deep .el-descriptions.is-bordered table th {
  border: 1px solid #EBEEF5;
}

/* 特别处理el-tag在描述列表中的样式 */
::v-deep .el-descriptions .el-tag {
  margin-right: 4px;
}
</style>
