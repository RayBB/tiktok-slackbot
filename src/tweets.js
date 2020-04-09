/*
This code is largely based on:
https://coderrocketfuel.com/article/publish-text-image-gif-and-video-twitter-posts-with-node-js
*/

require('dotenv').config()
const Twitter = require("twitter")
const fs = require("fs")
const client = new Twitter({
  consumer_key: process.env.twitter_consumer_key,
  consumer_secret: process.env.twitter_consumer_secret,
  access_token_key: process.env.twitter_access_token_key,
  access_token_secret: process.env.twitter_access_token_secret
})

module.exports = {
  tweetIt: async function (tweetText, pathToFile) {
    console.log(pathToFile, tweetText);
    const mediaType = "video/mp4"
    const mediaSize = fs.statSync(pathToFile).size;

    return initializeMediaUpload(mediaSize, mediaType)
      .then(async function (mediaId) { return sendAllChunks(mediaId, pathToFile) })
      .then(finalizeUpload)
      .then(checkMediaStatus)
      .then(async function(mediaid){return publishStatusUpdate(mediaid, tweetText)})
      .then(function(data){
          console.log(data)
          const tweet_out = `https://twitter.com/${data.user.screen_name}/status/${data.id_str}`
          console.log("Tweet available at " + tweet_out);
          return tweet_out;
      })
  }
};


function initializeMediaUpload(mediaSize, mediaType) {
  console.log("Initializing upload")
  console.log("media size: " + mediaSize)
  return new Promise(function (resolve, reject) {
    client.post("media/upload", {
      command: "INIT",
      total_bytes: mediaSize,
      media_type: mediaType,
      media_category: 'tweet_video'
    }, function (error, data, response) {
      if (error) {
        console.log(error)
        reject(error)
      } else {
        console.log("Upload initalized:")
        console.log(data)
        resolve(data.media_id_string)
      }
    })
  })
}

function sendAllChunks(mediaId, filename) {
  console.log("Send all chunks " + filename)
  console.log("media id " + mediaId)
  return new Promise(async function (resolve, reject) {
    const readChunk = require('read-chunk');
    //const filename = '6805953461646003461.mp4';
    const mediaSize = fs.statSync(filename).size
    const max_chunk_size = 5242880;
    let counter = 0;
    let uploadPromises = [];
    while (counter * max_chunk_size < mediaSize) {
      console.log("Loading chunks " + counter);
      let chunk = await readChunk.sync(filename, counter * max_chunk_size, (counter + 1) * max_chunk_size);
      let uploadPromise = appendFileChunkNew(mediaId, chunk, counter);
      uploadPromises.push(uploadPromise)
      counter++;
    }
    await Promise.all(uploadPromises)
    resolve(mediaId)
  })
}
function appendFileChunkNew(mediaId, mediaData, segment_id) {
  return new Promise(function (resolve, reject) {
    console.log("appending chunk")
    client.post("media/upload", {
      command: "APPEND",
      media_id: mediaId,
      media: mediaData,
      segment_index: segment_id
    }, function (error, data, response) {
      if (error) {
        console.log("CHUNK EROR")
        console.log(data)
        //console.log(response)
        console.log(error)
        reject(error)
      } else {
        resolve(mediaId)
      }
    })
  })
}

function checkMediaStatus(mediaId) {
  return new Promise(function (resolve, reject) {
    console.log("Checking media status");
    function checkStatusLooper() {
      client.get("media/upload", 
      {
        command: "STATUS",
        media_id: mediaId
      }, 
      function (error, data, response) {

        const processingInfo = data['processing_info'];
        const state = processingInfo['state']

        switch (state){
          case 'in_progress':
            setTimeout(() => { checkStatusLooper(); }, processingInfo['check_after_secs'] * 1000);
            break;
          case 'succeeded':
            console.log("Upload succeeded", data)
            resolve(mediaId);
            break;
          case 'failed':
            console.log("Upload failed", data)
            reject(mediaId)
            break;
          default:
            console.log("Default");
        }
      })
    }
    checkStatusLooper();
  })
}

function finalizeUpload(mediaId) {
  console.log("Finalize starting")
  return new Promise(function (resolve, reject) {
    client.post("media/upload", {
      command: "FINALIZE",
      media_id: mediaId
    }, function (error, data, response) {
      if (error) {
        console.log("finalize error")
        console.log(data)
        reject(error)
      } else {
        resolve(mediaId)
      }
    })
  })
}

function publishStatusUpdate(mediaId, status) {
  return new Promise(function (resolve, reject) {
    client.post("statuses/update", {
      status: status,
      media_ids: mediaId
    }, function (error, data, response) {
      if (error) {
        console.log(error)
        reject(error)
      } else {
        console.log("Successfully uploaded media and tweeted!")
        resolve(data)
      }
    })
  })
}