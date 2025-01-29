const express = require('express');
const path = require('path');
const ip = require('ip');
const app = express();
const port = 3000;

// 提供静态文件服务
app.use(express.static(path.join(__dirname, 'public')));

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 启动服务器
app.listen(port, '0.0.0.0', () => {
    const localIp = ip.address();
    console.log(`
服务器已启动:
- 本地访问: http://localhost:${port}
- 局域网访问: http://${localIp}:${port}
    `);
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err.stack);
    res.status(500).send('服务器出错了！');
}); 