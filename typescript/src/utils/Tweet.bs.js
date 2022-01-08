// Generated by ReScript, PLEASE EDIT WITH CARE


function shortenTweetText(text) {
  if (text.length > 140) {
    return text.substring(0, 140) + "...";
  } else {
    return text;
  }
}

function tweetUrl(id) {
  return "https://twitter.com/i/web/status/" + id;
}

export {
  shortenTweetText ,
  tweetUrl ,
  
}
/* No side effect */
