const express = require("express");
const path = require("path");
const homeRouter = require("./routers/homeRouter");
const {rizhiM, notFoundMF, handlerErrorMF, crossDomainM} = require("./middleware/jh_middleware");

// 创建express对象
let app = express();

// 处理POST请求参数的中间件
app.use(express.json(), express.urlencoded({extended: true}));
// 日志中间件
app.use(rizhiM);
// 跨域中间件
app.use(crossDomainM);
// 静态资源中间件
app.use(express.static(path.resolve(__dirname, "public")));

// 路由中间件
app.use("/", homeRouter);


// 404 中间件
app.use(notFoundMF(path.resolve(__dirname, "./defaultPages/404.html")));
// 500 中间件
app.use(handlerErrorMF(path.resolve(__dirname, "./defaultPages/500.html")));

// 监听端口
app.listen(5000, ()=>{
    console.log("撩学堂-后端项目服务器启动成功：localhost:5000/")
})