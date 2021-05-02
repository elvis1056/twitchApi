document.addEventListener("DOMContentLoaded", () => {

  const liveSection = document.querySelector('.liveSection');
  const cardsSection = document.querySelector('.sideBar__cards');

  const clientId = "75ni0m3qjhdw4wh1ucjyh16ltx0mpf";

  function getLiveStreams() {
    const xhr = new XMLHttpRequest();
    const apiUrl = `https://api.twitch.tv/kraken/streams/featured`
    xhr.open("GET", apiUrl);
    xhr.setRequestHeader("client-id", clientId);
    xhr.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
    xhr.send();
    xhr.onreadystatechange = function () {
      if ( xhr.readyState === 4 && xhr.status === 200 ) {
        let data = JSON.parse(xhr.responseText);
        console.log(data)
        creatLiveStreamDom(data.featured)
      } 
    }
  }

  function getRecommendedChannel() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://api.twitch.tv/kraken/streams?language=zh&limit=10`);
    xhr.setRequestHeader('client-id', clientId);
    xhr.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
    // xhr.onload = getLiveChannels;
    // xhr.onerror = errorHandler;
    xhr.send();
    xhr.onreadystatechange = function () {
      if ( xhr.readyState === 4 && xhr.status === 200 ) {
        let data = JSON.parse(xhr.responseText);
        creatRecommendedChannelDom(data.streams)
      } 
    }
  }

  getLiveStreams()
  getRecommendedChannel()

  function creatLiveStreamDom(data) {
    data.forEach((item, i) => {
      const element = document.createElement('div');
      element.className = 'liveStream';
      element.innerHTML = `
        <img src=${item.stream.preview.large} />
        <div class="liveStream__card">
          <div class="liveStream__headShot">
            <img src=${item.stream.channel.logo} />
          </div>
          <div class="liveStream__text">
            <div>${item.text}</div>
            <div>${item.stream.channel.display_name}</div>
            <div>${item.stream.channel.game}</div>
          </div>
        </div>
      `
      
      liveSection.appendChild(element)
    });
  }

  function creatRecommendedChannelDom(data) {
    data.forEach((item, i) => {
      const element = document.createElement('div');
      element.className = 'sideBar__row__card';
      element.innerHTML = `
        <a href=${item.channel.url}>
          <div class="sideBar__row__card__headShot">
            <img src=${item.channel.logo} />
          </div>
          <div class="sideBar__row__card__text">
            <div>${item.channel.display_name}</div>
            <div>${item.game}</div>
          </div>
          <div class="online marginRight5"></div>
          <div class="sideBar__row__card__num">${item.viewers}</div>
        </a>
      `
      
      cardsSection.appendChild(element)
    });
  }

})