function getGameNameFromHtml() {
  const gameTitle = document.querySelector('.game-header h1');
  const clonedGameTitleElement = gameTitle.cloneNode(true);
  clonedGameTitleElement.querySelector(".release-date").remove();
  return clonedGameTitleElement.innerText;
}

function searchGameInHLTB(gameName) {
  const payload = {
    searchType: "games",
    searchTerms: gameName.split(' ').filter((f) => f !== ""),
    searchPage: 1,
    size: 1,
    searchOptions: {
      games: {
        userId: 0,
        platform: "",
        sortCategory: "popular",
        rangeCategory: "main",
        rangeTime: { min: null, max: null },
        gameplay: { perspective: "", flow: "", genre: "" },
        rangeYear: { min: "", max: "" },
        modifier: "",
      },
      users: { sortCategory: "postcount" },
      lists: { sortCategory: "follows" },
      filter: "",
      sort: 0,
      randomizer: 0,
    },
  };

  return new Promise((resolve) => {
    fetch(`https://howlongtobeat.com/api/search`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://howlongtobeat.com",
      },
    })
      .then((response) => response.json())
      .then((json) => {
        const gameData = json.data[0];
        if (gameData) {
          resolve(gameData);
        }
      });
  });
}

function convertMinutesToHours(minutes) {
  const hoursWithDecimals = (minutes / 60 / 60);
  const hoursRoundedNearestQuarter = (Math.round(hoursWithDecimals * 4) / 4).toFixed(2);

  const hours = hoursRoundedNearestQuarter.split('.')[0]
  const decimals = hoursRoundedNearestQuarter.split('.')[1];
  let fraction = "";

  switch (decimals) {
    case '25':
      fraction = "¼"
      break;
    case '50':
      fraction = "½"
      break;
    case '75':
      fraction = "¾"
      break;
  }

  return hours + fraction;
}

function getHoursFromGameData(gameData) {
  const hours = {
    main: convertMinutesToHours(gameData.comp_main),
    extra: convertMinutesToHours(gameData.comp_plus),
    completionist: convertMinutesToHours(gameData.comp_100),
  };
  return hours;
}

function createRowHoursElement(label, hours) {
  const rowElement = document.createElement("div");
  rowElement.classList.add("row");

  const labelElement = document.createElement("div");
  labelElement.classList.add("col");
  labelElement.style = "font-weight: 600;";
  labelElement.innerText = label;
  rowElement.append(labelElement);

  const hoursElement = document.createElement("div");
  hoursElement.classList.add("col");
  hoursElement.innerText = `${hours} hours`;
  rowElement.append(hoursElement);

  return rowElement;
}

function addHoursToGamePage(hours) {
  const gameDescription = document.querySelector(".game-info");

  const hoursCardElement = document.createElement("div");
  hoursCardElement.style = "background: rgba(37,41,51,.9); margin-bottom: 30px;";

  const hoursCardContentElement = document.createElement("div");
  hoursCardContentElement.style = "padding: 20px;";

  const hoursCardTitleElement = document.createElement("h4");
  hoursCardTitleElement.innerText = "How Long To Beat";
  hoursCardContentElement.append(hoursCardTitleElement);

  const mainHoursElement = createRowHoursElement("Main", hours.main);
  const extraHoursElement = createRowHoursElement("Main + Extra", hours.extra);
  const completionistHoursElement = createRowHoursElement("Completionist", hours.completionist);
  hoursCardContentElement.append(mainHoursElement);
  hoursCardContentElement.append(extraHoursElement);
  hoursCardContentElement.append(completionistHoursElement);
  
  hoursCardElement.append(hoursCardContentElement);

  gameDescription.parentElement.insertBefore(hoursCardElement, gameDescription);
}

function onLoadGameInfo(callback) {
  const observer = new MutationObserver(() => {
    if (document.querySelector('.game-header h1')) {
      observer.disconnect();
      callback();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

function getHours() {
  const gameName = getGameNameFromHtml();
  searchGameInHLTB(gameName).then((gameData) => {
    const hours = getHoursFromGameData(gameData);
    addHoursToGamePage(hours);
  });
}

function isGamePage(url) {
  return url.match(/(\/games\/).+/);
}

function listenUrlChanges() {
  let lastUrl = undefined;
  new MutationObserver(() => {
    const currentUrl = location.href;
    if (lastUrl !== currentUrl) {
      lastUrl = currentUrl;
      if (isGamePage(lastUrl)) {
        onLoadGameInfo(getHours);
      }
    }
  }).observe(document, { subtree: true, childList: true });
}

listenUrlChanges();