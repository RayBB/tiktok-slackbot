/*
GOAL:
Create a function that takes a tiktok url and returns a twitter url with the video uploaded

Steps:

1. Download Video from Tiktok
2. Upload Video to Twitter
2.1  Save tiktok<>twitter mapping
3. Delete Video from local server
4. Return Twitter url
*/

let twitBot = require('./tweets')
let tiktok = require('./tiktok')
let fs = require('fs')


async function tiktokToTweet(postUrl) {
    postUrl = postUrl.split("?")[0]; // removes query params
    const videoUrlandId = await tiktok.findTikTokVideoURL(postUrl)
    const tikTokPostId = videoUrlandId['postId']
    const filename = `/tmp/${tikTokPostId}.mp4`;

    cachedTweet = await getTweetByTokId(tikTokPostId);
    if (cachedTweet !== undefined){
        return cachedTweet;
    }

    await tiktok.downloadVideo(videoUrlandId['url'], filename);

    console.log("bouta tweet")
    const tweetText = `I Tweeted a #tiktok ${postUrl}`
    const tweeturl = await twitBot.tweetIt(tweetText, filename)
    fs.unlinkSync(filename)
    return tweeturl;
}

async function getTweetByTokId(tikTokPostId){
    // TODO: Implement datastore/caching
    let tokToTweetMap = {}
    return tokToTweetMap[tikTokPostId];
}

module.exports = { getTwitterUrl: tiktokToTweet }