/*

This is a Slackbot made with the Bolt framework.

The Slackbot requires the following permissions:
1. App unfurl domains: tiktok.com
2. Subscribe to bot events: link_shared
3. Bot Token Scopes: links:read, chat:write

Then add the Slackbot to any channel where you would like it to unfurl TikTok links
It will always reply in a thread. It will reply to messaged that are in a thread

*/

require('dotenv').config()
const { App } = require("@slack/bolt");
let tok_to_tweet = require('./tok_to_tweet');


const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN
});

let seenMessages = new Set();

app.event("link_shared", async ({ event, say }) => {
  console.log("LINK SHARED");
  console.log(event);
  if (seenRecently(event.message_ts)) return

  let twitterPromises = [];
  for (let item of event.links) {
    const pendingTweet = tok_to_tweet.getTwitterUrl(item['url']);
    twitterPromises.push(pendingTweet);
  }
  const twitterUrls = await Promise.all(twitterPromises);

  // Reply in a thread by default
  let timeStamp = event.message_ts;
  // if the message came from a thread (has thread_ts), respond to parent message
  if ('thread_ts' in event) {
    console.log("found thread_ts");
    timeStamp = event.thread_ts;
  }

  app.client.chat.postMessage({
    token: process.env.SLACK_BOT_TOKEN,
    text: "I got you!\n" + twitterUrls.join("\n"),
    channel: event.channel,
    thread_ts: timeStamp,
  })
});

function seenRecently(timeStamp) {
  /*
  This is to prevent issues with double posting messages when the app cold starts and slack does a retry
  */
  if (seenMessages.has(timeStamp)) return true;

  seenMessages.add(timeStamp);
  // Remove timestamp from set in 5 minutes
  setTimeout(() => seenMessages.delete(timeStamp), 5000 * 60);
  return false;
}

// Start your app
(async () => {
  await app.start(process.env.PORT || 3000);
  console.log("⚡️ Bolt app is running!");
})();
