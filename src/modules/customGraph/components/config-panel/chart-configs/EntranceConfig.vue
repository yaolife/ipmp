<template>
  <div class="consult-list-config">
    <!-- 基础配置 -->
    <el-form label-width="120px" size="small" class="left-aligned-form">
      <el-form-item label="显示标题">
        <el-checkbox
          class="checkbox-info"
          :disabled="readonly"
          v-model="localConfig.showTitile"
        ></el-checkbox>
      </el-form-item>
      <!-- 标题配置 -->
      <el-form-item label="组件标题">
        <el-input
          v-model="localConfig.title"
          :disabled="readonly"
          placeholder="请输入组件顶部显示的标题"
        />
      </el-form-item>

      <!-- 行距 -->
      <el-form-item label="行距">
        <el-input-number
          v-model="localConfig.lineSpacing"
          :disabled="readonly"
          :min="1"
          :max="100"
          :step="1"
        />
      </el-form-item>

      <!-- 入口间距 -->
      <el-form-item v-if="false" label="入口间距">
        <el-input-number
          v-model="localConfig.scpacing"
          :disabled="readonly"
          :min="1"
          :max="100"
          :step="1"
        />
      </el-form-item>
      <!-- 图片宽度 -->
      <el-form-item v-if="false" label="图片宽度">
        <el-input-number
          v-model="localConfig.imageWidth"
          :disabled="readonly"
          :min="1"
          :max="200"
          :step="10"
        />
      </el-form-item>

      <!-- 字体大小 -->
      <el-form-item label="字体大小">
        <el-input-number
          v-model="localConfig.nameSize"
          :disabled="readonly"
          :min="1"
          :max="100"
          :step="1"
        />
      </el-form-item>

      <!-- 图片与名称行距 -->
      <el-form-item label="图片与名称行距">
        <el-input-number
          :disabled="readonly"
          v-model="localConfig.imgLineSpacing"
          :min="1"
          :max="100"
          :step="1"
        />
      </el-form-item>

      <!-- 数据源类型 -->
      <el-form-item label="数据源类型">
        <el-select
          v-model="localConfig.type"
          placeholder="请选择数据源类型"
          @change="changeType"
          :disabled="readonly"
        >
          <el-option label="静态" value="1" />
          <el-option label="动态" value="2" />
        </el-select>
      </el-form-item>

      <el-form-item label="数据源" v-if="localConfig.type === '2'">
        <el-input
          v-model="localConfig.dataUrl"
          :disabled="readonly"
          placeholder="请输入数据源"
        />
      </el-form-item>

      <!-- 保存和重置按钮 -->
      <el-form-item class="form-buttons" v-if="!readonly">
        <el-button type="primary" size="small" @click="handleSave"
          >保存</el-button
        >
        <el-button size="small" @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
    <div v-if="localConfig.type === '1'" class="configClass">
      <div class="config-box">入口配置</div>
      <el-button @click="handleAdd">新增</el-button>
      <div
        v-for="(item, index) in localConfig.entranceList"
        :key="index"
        class="addForm"
      >
        <el-form
          label-width="100px"
          size="small"
          class="left-aligned-form left"
        >
          <!-- 入口名称 -->
          <el-form-item label="入口名称">
            <el-input
              v-model="item.name"
              :disabled="readonly"
              placeholder="请输入组入口名称"
            />
          </el-form-item>
          <!-- 跳转url -->
          <el-form-item label="跳转URL">
            <el-input
              v-model="item.url"
              :disabled="readonly"
              placeholder="请输入跳转URL"
            />
          </el-form-item>
          <!-- 公告栏图片 -->
          <el-form-item label="图标">
            <el-popover placement="right" width="200" trigger="click">
              <div class="iconBox">
                <div
                  class="myIcon"
                  v-for="iconItem in iconLists"
                  :key="iconItem.icon"
                  @click="iconClick(iconItem, item)"
                >
                  <!-- @click="item.image = iconItem.icon" -->
                  <i class="iconfont">{{ iconfontFn(iconItem.icon) }}</i>
                </div>
              </div>
              <div class="uploaderBox" slot="reference">
                <i
                  class="el-icon-plus avatar-uploader-icon"
                  v-if="!item.imageIcon"
                ></i>
                <i class="iconfont" v-else>{{ iconfontFn(item.imageIcon) }}</i>
              </div>
            </el-popover>
            <!-- <div class="image-upload-container">
              <div class="image-preview-wrapper">
                <img
                  v-if="item.image"
                  class="imgage"
                  :src="item.image"
                  alt=""
                />
                <el-upload
                  action=""
                  class="import-upload"
                  :show-file-list="false"
                  :http-request="handUpLoad"
                >
                  <div>
                    <el-button
                      @click="handleImg(item)"
                      class="btn"
                      :disabled="readonly"
                      >上传</el-button
                    >
                  </div>
                </el-upload>
                <div class="image-action">
                  <i
                    class="el-icon-close"
                    :disabled="readonly"
                    @click="removeImage(item)"
                  ></i>
                </div>
              </div>
            </div> -->
          </el-form-item>
        </el-form>
        <div class="right">
          <i class="el-icon-top" @click="move(index, 'top')"></i>
          <i class="el-icon-bottom" @click="move(index, 'bottom')"></i>
          <i class="el-icon-delete" @click="removeConfig(index)"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import iconList from "../../json/icon.json";
import { iconfont } from "@/utils/funcUtil";
export default {
  name: "EntranceConfig",
  props: {
    config: {
      type: Object,
      default: () => ({}),
      required: true,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      iconLists: iconList,
      imgObj: {},
      localConfig: {
        title: "快捷入口",
        showTitile: true,
        lineSpacing: 16,
        scpacing: 12,
        nameSize: 14,
        imageWidth: 80,
        imgLineSpacing: 10,
        type: "1",
        dataUrl: "", // mock数据源
        entranceList: [], // 存储资讯列表数据
      },
    };
  },
  watch: {
    config: {
      immediate: true,
      handler(newConfig) {
        console.log("iconList", iconList);
        console.log("iconfont", iconfont);
        this.localConfig = {
          ...this.localConfig,
          ...newConfig,
          entranceList: [
            ...(newConfig.entranceList ? newConfig.entranceList : []),
          ],
        };
      },
    },
  },
  methods: {
    iconClick(icon, item) {
      // item.imageIcon = icon.icon
      this.$set(item, "imageIcon", icon.icon);
    },
    iconfontFn(icon) {
      return iconfont(icon);
    },
    move(index, name) {
      if (name === "top") {
        if (index === 0) {
          this.$message.error("第一个元素不可以向上移动！");
        } else {
          let arr = this.localConfig.entranceList;
          this.localConfig.entranceList[index] = arr.splice(
            index - 1,
            1,
            arr[index]
          )[0];
        }
      } else {
        if (index === this.localConfig.entranceList.length - 1) {
          this.$message.error("最后一个元素不可以向下移动！");
        } else {
          let arr = this.localConfig.entranceList;
          this.localConfig.entranceList[index] = arr.splice(
            index + 1,
            1,
            arr[index]
          )[0];
        }
      }
    },
    changeType(val) {
      if (val === "2") {
        this.localConfig.dataUrl = "ds/getQuickEnter";
      }
    },
    removeConfig(index) {
      this.localConfig.entranceList.splice(index, 1);
    },
    handleImg(item) {
      this.imgObj = item;
    },
    handleAdd() {
      let obj = {
        name: "",
        url: "",
        image: "",
      };
      this.localConfig.entranceList.push(obj);
    },
    // 移除图片
    removeImage(item) {
      this.$confirm("确定要删除此图片吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          item.image = "";
          this.updateConfig();
          this.$message({
            type: "success",
            message: "删除成功!",
          });
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消删除",
          });
        });
    },
    // 图片上传前的验证
    handUpLoad(fileobj) {
      const file = fileobj.file;
      const isImage = fileobj.file.type.startsWith("image/");
      const isLt2M = fileobj.file.size / 1024 / 1024 < 2;

      if (!isImage) {
        this.$message.error("只能上传图片文件!");
        return false;
      }
      if (!isLt2M) {
        this.$message.error("图片大小不能超过 2MB!");
        return false;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imgObj.image = e.target.result;
        this.updateConfig();
      };
      reader.readAsDataURL(fileobj.file);
    },
    updateConfig(isSave = false) {
      // 验证数据
      if (this.localConfig.type === "2" && !this.localConfig.dataUrl) {
        this.$message.error("请填写动态数据源URL");
        return;
      }
      const isEmpty = this.localConfig.entranceList.every((item) => {
        return item.image || item.name || item.url;
      });
      if (!isEmpty) {
        this.$message.error("请填写静态数据");
        return;
      }
      const updatedConfig = {
        ...this.localConfig,
        entranceList: this.localConfig.entranceList || [],
      };
      this.$emit("update", updatedConfig, isSave);
    },
    handleSave() {
      this.updateConfig(true);
    },
    handleReset() {
      console.log("this.localConfig", this.localConfig);
      const container = {
        title: "快捷入口",
        lineSpacing: 16,
        scpacing: 12,
        nameSize: 14,
        imageWidth: 80,
        showTitile: true,
        imgLineSpacing: 16,
        type: "1",
        dataUrl: "", // mock数据源
        entranceList: [], // 存储资讯列表数据
      };
      this.localConfig = {
        ...container,
        ...this.config,
      };
      this.$message({
        message: "配置已重置",
        type: "info",
      });
    },
  },
};
</script>

<style lang="less" scoped>
.checkbox-info {
  line-height: 32px;
}
.uploaderBox {
  width: 50px;
  height: 50px;
  border: 1px dashed #d9d9d9;
  font-size: 20px;
  text-align: center;
  line-height: 50px;
  cursor: pointer;
}
.iconBox {
  width: 100%;
  height: 350px;
  display: flex;
  flex-wrap: wrap;
  overflow-y: scroll;
  .myIcon {
    text-align: center;
    width: 33%;
    cursor: pointer;
  }
}
.iconfont {
  font-size: 30px;
}
.consult-list-config {
  padding: 10px;
  .addForm {
    border: 1px solid #dcdfe6;
    margin-top: 10px;
    padding-top: 10px;
    display: flex;
    border-radius: 4px;
    .left {
      width: 90%;
    }
    .right {
      width: 10%;
      display: flex;
      flex-flow: column;
      font-size: 18px;
      font-weight: bold;
      i {
        cursor: pointer;
        margin-top: 20px;
      }
    }
  }

  .left-aligned-form {
    text-align: left;

    .el-form-item {
      margin-bottom: 18px;
    }
  }

  .form-buttons {
    display: flex;
    justify-content: flex-start;
    position: absolute;
    z-index: 1000;
    bottom: 10px;
    right: 77px;
    .el-button {
      margin-right: 10px;
    }
  }
}
.config-box {
  font-weight: bold;
  color: #606266;
  font-size: 14px;
  line-height: 20px;
}
.image-upload-container {
  width: 100%;

  .image-preview-wrapper {
    display: flex;
    height: 80px;

    .image-preview {
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-hover-mask {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;
        color: #fff;

        i {
          font-size: 20px;
          margin-bottom: 4px;
        }

        span {
          font-size: 12px;
        }
      }

      &:hover .image-hover-mask {
        opacity: 1;
      }
    }

    .image-actions {
      position: absolute;
      top: 4px;
      right: 4px;
      z-index: 1;

      .el-button {
        padding: 4px;
        border: none;
        background-color: rgba(0, 0, 0, 0.5);

        &:hover {
          background-color: rgba(0, 0, 0, 0.7);
        }

        i {
          color: #fff;
          font-size: 12px;
        }
      }
    }
  }

  .upload-placeholder {
    width: 120px;
    height: 80px;
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s;
    background-color: #fff;
    padding: 8px;
    gap: 4px;

    &:hover {
      border-color: #409eff;
      color: #409eff;
    }

    &.disabled {
      cursor: not-allowed;
      opacity: 0.6;

      &:hover {
        border-color: #dcdfe6;
        color: inherit;
      }
    }

    i {
      font-size: 16px;
      margin-bottom: 4px;
      color: #909399;
      line-height: 1;
    }

    span {
      font-size: 12px;
      color: #909399;
      line-height: 1.2;
    }
  }
}

.image-uploader {
  display: block;
  width: 100%;
  height: 100%;
}
.imgage {
  width: 50px;
  height: 50px;
}
.btn {
  margin-left: 10px;
}
.el-icon-delete {
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
}
.el-icon-close {
  font-size: 16px;
  font-weight: bold;
  margin-left: 10px;
  cursor: pointer;
}
.configClass {
  margin-bottom: 10px;
}
</style>
