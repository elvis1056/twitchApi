document.addEventListener("DOMContentLoaded", () => {

  const { Twitch } = window;

  const options = {
    width: '100%',
    height: '100%',
    channel: 'channel name',
    parent: ['127.0.0.1', 'localhost', 'elvis1056.github.io'],
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
        creatCarouselCard(data.featured)
      } 
    }
  }

  function creatLiveStreamDom(data) {
    data.forEach((item, i) => {
      const element = document.createElement('div');
      element.className = 'liveStream';
      element.innerHTML = `
        <a href=${item.channel.url}>
          <img src=${item.preview.large} />
        </a>
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

  
  function getCarouselTwitchPlayer() {
    const centerID = document.querySelector('.center .video').getAttribute('id');
    document.querySelector('.center .view > img').classList.add('none');
    document.querySelector('.center .video').setAttribute("style", "height: 360px");
    options.channel = centerID;
    const player = new Twitch.Player(centerID, options);
    // console.log(player)
    player.play();
    player.setVolume(0.5);
    return player;
  }

  function stopCarousel(left, right) {
    console.log(left, right)
    if (left) {
      const leftChannelId = document.querySelector('.left__first__card .video');
      document.querySelector('.left__first__card .view > img').classList.remove('none');
      document.querySelector('.left__first__card .video').setAttribute("style", "height: 100%");
      leftChannelId.innerHTML = '';
    }
  
    if (right) {
      const rightChannelId = document.querySelector('.right__first__card .video');
      document.querySelector('.right__first__card .view > img').classList.remove('none');
      document.querySelector('.right__first__card .video').setAttribute("style", "height: 100%");
      rightChannelId.innerHTML = '';
    }
  }

  function creatCarouselCard(data) {
    data.forEach((item, i) => {
      options.channel = item.stream.channel._id;
      carouselCards[i].innerHTML = `
        <div class="view">
          <div class="video" id="${item.stream.channel.name}"></div>
          <img src=${item.stream.preview.large} />
          <div class="info">
            <div class="info__block">
              <div class="info__avatar">
                <img src="${item.stream.channel.logo}" />
              </div>
              <div class="info__text">
                <a href="${item.stream.channel.url}">${item.stream.channel.name}</a>
                <a href="#" >${item.stream.game}</a>
                <div>${item.stream.viewers} viewers</div>
              </div>
            </div>
            <div class="info__tag">${item.stream.channel.broadcaster_language}</div>
            <div class="info__des">${item.stream.channel.description}</div>
          </div>
        </div>
      `
    })
    getCarouselTwitchPlayer()
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
          stopCarousel(false, true)
          break;
        case 'right__first__card':
          el.classList.add('carousel__card', 'center');
          getCarouselTwitchPlayer()
          break;
        case 'right__last__card':
          el.classList.add('carousel__card', `right__first__card`);
          break;
        // default:
        //   break;
      }
    });
  })

  rightArrow.addEventListener('click', () => {
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
        stopCarousel(true, false)
        break;
      case 'right__first__card':
        el.classList.add('carousel__card', 'center');
        getCarouselTwitchPlayer()
        break;
      case 'right__last__card':
        el.classList.add('carousel__card', `right__first__card`);
        break;
      // default:
      //   break;
      }
    });
  });

  getLiveStreams()
  getRecommendedChannel()
  requestClips()

})