const http = require('http');
const fs = require('fs');

const url = 'https://api.ethiopianitpark.et/uploads/id-photos/photo-1769606445066-34384266.jpg';

http.get(url, (res) => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);

    if (res.statusCode === 200) {
        const file = fs.createWriteStream("downloaded_test.jpg");
        res.pipe(file);
        file.on('finish', () => {
            file.close();
            console.log('Download completed');
        });
    } else {
        console.log('Failed to download');
    }
}).on('error', (err) => {
    console.error(`Error: ${err.message}`);
});
