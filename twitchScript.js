document.addEventListener("DOMContentLoaded", () => {

  const { Twitch } = window;

  const options = {
    width: '100%',
    height: '100%',
    channel: 'channel name',
    parent: ['127.0.0.1', 'localhost'],
  };

  const liveSection = document.querySelector('.liveSection');
  const cardsSection = document.querySelector('.sideBar__cards');
  const carouselCards = document.querySelectorAll('.carousel__card');
  const leftArrow = document.querySelector('.left__arrow');
  const rightArrow = document.querySelector('.right__arrow');

  const clientId = "75ni0m3qjhdw4wh1ucjyh16ltx0mpf";

  function getLiveStreams() {
    const xhr = new XMLHttpRequest();
    const apiUrl = `https://api.twitch.tv/kraken/streams/?language=zh`
    xhr.open("GET", apiUrl);
    xhr.setRequestHeader("client-id", clientId);
    xhr.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
    xhr.send();
    xhr.onreadystatechange = function () {
      if ( xhr.readyState === 4 && xhr.status === 200 ) {
        let data = JSON.parse(xhr.responseText);
        creatLiveStreamDom(data.streams)
      } 
    }
  }

  function getRecommendedChannel() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://api.twitch.tv/kraken/streams?language=zh&limit=10`);
    xhr.setRequestHeader('client-id', clientId);
    xhr.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
    xhr.send();
    xhr.onreadystatechange = function () {
      if ( xhr.readyState === 4 && xhr.status === 200 ) {
        let data = JSON.parse(xhr.responseText);
        creatRecommendedChannelDom(data.streams)
      } 
    }
  }

  function requestClips() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `https://api.twitch.tv/kraken/streams/featured?limit=5`);
    xhr.setRequestHeader('client-id', clientId);
    xhr.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
    xhr.send();
    xhr.onreadystatechange = function () {
      if ( xhr.readyState === 4 && xhr.status === 200 ) {
        let data = JSON.parse(xhr.responseText);
        console.log(data.featured)
        creatCarouselCard(data.featured)
      } 
    }
  }

  getLiveStreams()
  getRecommendedChannel()
  requestClips()

  function creatLiveStreamDom(data) {
    data.forEach((item, i) => {
      const element = document.createElement('div');
      element.className = 'liveStream';
      element.innerHTML = `
        <img src=${item.preview.large} />
        <div class="liveStream__card">
          <div class="liveStream__headShot">
            <img src=${item.channel.logo} />
          </div>
          <div class="liveStream__textSection">
            <a href=${item.channel.url}>
              <div class="liveStream__text__status">${item.channel.status}</div>
            </a>
            <a href="${item.channel.url}/videos/all">
              <div class="liveStream__text__name">${item.channel.display_name}</div>
            </a>
            <a href="https://www.twitch.tv/directory/game/${item.channel.game}">
              <div class="liveStream__text__game">${item.channel.game}</div>
            </a>
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

  function creatCarouselCard(data) {
    data.forEach((item, i) => {
      const element = document.createElement('div');
      element.className = 'view';
      element.setAttribute("id", item.stream.channel.name)
      carouselCards[i].appendChild(element)
    })
  }

  function carouselPlay(channelName) {
    options.channel = channelName;
    const player = new Twitch.Player(channelName, options);
    return player;
  }

  leftArrow.addEventListener('click', () => {
    carouselCards.forEach((el) => {
      const position = el.classList[1];
      el.classList.remove(...el.classList);
      switch (position) {
        case 'left__last__card':
          el.classList.add('carousel__card', `right__last__card`);
          break;
        case 'left__first__card':
          el.classList.add('carousel__card', `left__last__card`);
          break;
        case 'center':
          el.classList.add('carousel__card', `left__first__card`);
          break;
        case 'right__first__card':
          el.classList.add('carousel__card', 'center');
          break;
        case 'right__last__card':
          el.classList.add('carousel__card', `right__first__card`);
          break;
        // default:
        //   break;
      }
    });

    leftArrow.addEventListener('click', () => {
      carouselCards.forEach((el) => {
      const position = el.classList[1];
      console.log(position)
      el.classList.remove(...el.classList);
      switch (position) {
        case 'left__last__card':
          el.classList.add('carousel__card', `right__last__card`);
          break;
        case 'left__first__card':
          el.classList.add('carousel__card', `left__last__card`);
          break;
        case 'center':
          el.classList.add('carousel__card', `left__first__card`);
          break;
        case 'right__first__card':
          el.classList.add('carousel__card', 'center');
          break;
        case 'right__last__card':
          el.classList.add('carousel__card', `right__first__card`);
          break;
        // default:
        //   break;
      }
    });
  });
})