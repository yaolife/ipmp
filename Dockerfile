FROM ue-harbor.gnpjvc.cgnpc.com.cn/library/base_nginx:1.27
ENV  TZ=Asia/Shanghai

COPY ./dist/test/index.html /usr/share/nginx/html/
COPY ./dist/test/static  /usr/share/nginx/html/static/
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
