<template>
    <div>
        <iframe @load="iframeLoad" frameborder=0 ref="ascframe" :height="height" :src="url"
                :width="width"
                scrolling=auto></iframe>
    </div>
</template>

<script>
    export default {
        name: "asc-base",
        data() {
            return {
                url: envConfig.ASC_ROOT + this.src + "?appCode=" + envConfig.APP_CODE,  // 默认地址
                messageData: [Array]
            }
        },
        methods: {
            iframeLoad() {
                this.$refs.ascframe.contentWindow.postMessage(this.selected, "/");
            },
            messageListener(messageEvent) {
                window.removeEventListener('message', this.messageListener, false);
                this.$emit('handle', messageEvent.data);
            },
        },
        watch: {
            src: {
                immediate: true,
                handler(val) {
                    this.url = envConfig.ASC_ROOT + val + "?appCode=" + envConfig.APP_CODE;
                    window.addEventListener('message', this.messageListener, false);
                    if (this.$refs.ascframe) {
                        this.$refs.ascframe.src = this.url;
                    }
                }
            },
        },
        mounted() {
            //
        },
        beforeDestroy() {
            window.removeEventListener('message', this.messageListener, false);
        },
        props: {
            height: {type: Number, default: 400},
            width: {type: Number, default: 600},
            src: String,
            handle: Function,
            selected: Array
        }
    }
</script>

<style scoped>

</style>
