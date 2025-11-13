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

  const TWITCH_CLIENT_ID = "75ni0m3qjhdw4wh1ucjyh16ltx0mpf";
  const TWITCH_BEARER_TOKEN = "Bearer os3esjj9dfi80x6jlq4nptmh0u176d" // quick expiration of certificates

  function getStreams() {
    const xhr = new XMLHttpRequest();
    const apiUrl = `https://api.twitch.tv/helix/streams/?language=zh&type=live`
    xhr.open("GET", apiUrl);
    xhr.setRequestHeader("client-id", TWITCH_CLIENT_ID);
    xhr.setRequestHeader("Authorization", TWITCH_BEARER_TOKEN)
    xhr.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
    xhr.send();
    xhr.onreadystatechange = function () {
      if ( xhr.readyState === 4 && xhr.status === 200 ) {
        let data = JSON.parse(xhr.responseText);
        creatLiveStreamDom(data.data)
        creatRecommendedChannelDom(data.data)
        creatCarouselCard(data.data.splice(0,5))
      } 
    }
  }

  // function getRecommendedChannel() {
  //   const xhr = new XMLHttpRequest();
  //   xhr.open('GET', `https://api.twitch.tv/helix/streams?language=zh`);
  //   xhr.setRequestHeader('client-id', TWITCH_CLIENT_ID);
  //   xhr.setRequestHeader("Authorization", TWITCH_BEARER_TOKEN)
  //   xhr.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
  //   xhr.send();
  //   xhr.onreadystatechange = function () {
  //     if ( xhr.readyState === 4 && xhr.status === 200 ) {
  //       let data = JSON.parse(xhr.responseText);
  //       creatRecommendedChannelDom(data.data)
  //       creatCarouselCard(data.data.splice(0,5))
  //     } 
  //   }
  // }

  // function requestClips() {
  //   const xhr = new XMLHttpRequest();
  //   xhr.open('GET', `https://api.twitch.tv/kraken/streams/featured?limit=5`);
  //   xhr.setRequestHeader('client-id', TWITCH_CLIENT_ID);
  //   xhr.setRequestHeader("Authorization", TWITCH_BEARER_TOKEN)
  //   xhr.setRequestHeader('Accept', 'application/vnd.twitchtv.v5+json');
  //   xhr.send();
  //   xhr.onreadystatechange = function () {
  //     if ( xhr.readyState === 4 && xhr.status === 200 ) {
  //       let data = JSON.parse(xhr.responseText);
  //       creatCarouselCard(data.featured)
  //     } 
  //   }
  // }

  function creatLiveStreamDom(data) {
    data.forEach((item, i) => {
      const element = document.createElement('div');
      element.className = 'liveStream';
      element.innerHTML = `
        <div class="liveStream__img__wrapper">
          <a href="https://www.twitch.tv/${item.user_login}">
            <img src=${item.thumbnail_url.replace("{width}", 440).replace("{height}", 248)} />
          </a>
        </div>
        <div class="liveStream__card">
          <div class="liveStream__headShot">
            <img src=${item.thumbnail_url.replace("{width}", 440).replace("{height}", 248)} />
          </div>
          <div class="liveStream__textSection">
            <a href="https://www.twitch.tv/${item.user_login}">
              <div class="liveStream__text__status">${item.title}</div>
            </a>
            <a href="https://www.twitch.tv/${item.user_login}/videos">
              <div class="liveStream__text__name">${item.user_name}</div>
            </a>
            <a href="https://www.twitch.tv/directory/category${toSlug(item.game_name)}">
              <div class="liveStream__text__game">${item.game_name}</div>
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
        <a href="https://www.twitch.tv/${item.user_login}">
          <div class="sideBar__row__card__headShot">
            <img src=${item.thumbnail_url.replace("{width}", 440).replace("{height}", 248)}  />
          </div>
          <div class="sideBar__row__card__text">
            <div>${item.user_name}</div>
            <div class="card__text__name">${item.game_name}</div>
          </div>
          <div class="online marginRight5"></div>
          <div class="sideBar__row__card__num">${item.viewer_count}</div>
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
    player.play();
    player.setVolume(0.5);
    return player;
  }

  function stopCarousel(left, right) {
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

  function toSlug(name) {
    return name.toLowerCase().replace(/\s+/g, "-");
  }

  function creatCarouselCard(data) {
    data.forEach((item, i) => {
      options.channel = item.user_login;
      carouselCards[i].innerHTML = `
        <div class="view">
          <div class="video" id="${item.user_login}"></div>
          <img src=${item.thumbnail_url.replace("{width}", 440).replace("{height}", 248)} />
          <div class="info">
            <div class="info__block">
              <div class="info__avatar">
                <img src="${item.thumbnail_url.replace("{width}", 440).replace("{height}", 248)}" />
              </div>
              <div class="info__text">
                <a href="https://www.twitch.tv/${item.user_name}">${item.user_name}</a>
                <a href="https://www.twitch.tv/directory/category${toSlug(item.game_name)}" >${item.game_name}</a>
                <div>${item.viewer_count} viewers</div>
              </div>
            </div>
            ${item.tags.map(tag => `<div class="info__tag">${tag}</div>`)}
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
          el.classList.add('carousel__card', `left__first__card`);
          break;
        case 'left__first__card':
          el.classList.add('carousel__card', 'center');
          getCarouselTwitchPlayer()
          break;
        case 'center':
          el.classList.add('carousel__card', `right__first__card`);
          stopCarousel(false, true)
          break;
        case 'right__first__card':
          el.classList.add('carousel__card', `right__last__card`);
          break;
        case 'right__last__card':
          el.classList.add('carousel__card', `left__last__card`);
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

  getStreams()
  // getRecommendedChannel()
  // requestClips()
})