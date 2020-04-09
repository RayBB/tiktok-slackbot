const https = require('https')
const axios = require('axios')
const fs = require('fs');

async function findTikTokVideoURL(postUrl) {
    console.log(postUrl);

    if (postUrl.indexOf("https://vm.tiktok.com") == 0) {
        console.log("finding unshortened url")
        postUrl = await unShortenUrl(postUrl)
    }

    let response = await axios.get(postUrl, { headers: { 'User-Agent': 'request' } });
    const body = response.data;
    const start = body.indexOf("<video")
    const end = body.indexOf("video>") + 6;
    const videoTag = body.slice(start, end);

    const url = videoTag.match(/src=\"[^\"]*/)[0].slice(5)
    const postId = postUrl.match(/video\/\d+/)[0].match(/\d+/)[0]

    const result = { "url": url, "postId": postId }
    return result
}

async function unShortenUrl(shortUrl) {
    console.log("unshortening url")
    let out = await axios.get(shortUrl, { headers: { 'User-Agent': 'request' } });
    const longerUrl = out.data.match(/https:\/\/www.tiktok.com\/@[^"]+/)[0]
    return longerUrl;
}

function downloadVideo(videoUrl, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        https.get(videoUrl, function (response) {
            response.pipe(file)
                .on('finish', function () {
                    resolve("finish");
                })
        });
    });
}

module.exports = {
    findTikTokVideoURL: findTikTokVideoURL,
    downloadVideo: downloadVideo
}