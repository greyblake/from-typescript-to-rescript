function shortenTweetText(text: string): string {
    if (text.length > 140) {
        return text.substring(0, 140) + '...';
    } else {
        return text;
    }
}

function tweetUrl(tweetId: string): string {
    return `https://twitter.com/i/web/status/${tweetId}`;
}

export { shortenTweetText, tweetUrl }
