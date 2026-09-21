import axios from "@/api/http";

const controlUrl = "/dict/dictTreeItem";

export default {
  methods: {
    dictTreeItem(dictCode) {
      return new Promise((resolve, reject) => {
        axios.post(controlUrl, { dictCode }).then(res => {
          let data = [];
          if (res.data.code === "0" && res.data.data.row) {
            data = res.data.data.row.map(item => {
              return {
                value: item.itemValue,
                label: item.itemText
              };
            });
          }
          resolve(data);
        });
      });
    }
  }
};
