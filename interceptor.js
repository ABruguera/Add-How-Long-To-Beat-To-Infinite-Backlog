function changeHeaders(e) {
    console.log(e.requestHeaders);
    return { requestHeaders: [
        ...e.requestHeaders, 
        { name: "Referer", value: "https://howlongtobeat.com" }, 
        { name: "Origin", value: "https://howlongtobeat.com" }] 
    };
}

browser.webRequest.onBeforeSendHeaders.addListener(
    changeHeaders,
    { urls: ["https://howlongtobeat.com/api/search"] },
    ["blocking", "requestHeaders"]
);