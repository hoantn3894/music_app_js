const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'CONFIG_PLAYER';
const progress = $('#progress');
const player = $('.player');
const heading = $('header h2');
const cd = $('.cd');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');


const app = {
    currentIndex: 2,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    setConfig: function (key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [
        {
            name: "Faded - EDM",
            singer: "Alan Walker",
            path: "./assets/music/faded.mp3",
            image: "./assets/img/photo01.jpeg"
        },
        {
            name: "Alone - EDM",
            singer: "Alan Walker",
            path: "./assets/music/alone.mp3",
            image: "./assets/img/photo02.jpg"
        },
        {
            name: "At My Worst",
            singer: "Pink Sweat",
            path: "./assets/music/atmyworst.mp3",
            image: "./assets/img/photo03.jpeg"
        },
        {
            name: "Reality",
            singer: "Lost Frequencies",
            path: "./assets/music/reality.mp3",
            image: "./assets/img/photo04.jpg"
        },
        {
            name: "I Do",
            singer: "911",
            path: "./assets/music/ido.mp3",
            image: "./assets/img/photo05.png"
        },
        {
            name: "Take Me To Your Heart",
            singer: "Michael Learns To Rock",
            path: "./assets/music/heart.mp3",
            image: "./assets/img/photo06.jpeg"
        },
        {
            name: "My Love",
            singer: "Westlife",
            path: "./assets/music/mylove.mp3",
            image: "./assets/img/photo07.jpg"
        },
        {
            name: "Love Is Gone",
            singer: "SLANDER  ft. Dylan Matthew",
            path: "./assets/music/loveyourgone.mp3",
            image: "./assets/img/photo08.jpg"
        },

    ],
    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }, 300)
    },
    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },
    nextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    prevSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
    },
    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex;
        this.loadCurrentSong();
    },
    start: function () {
        // G??n c???u h??nh t??? config t??? ???ng d???ng
        this.loadConfig()

        // ?????nh ngh??a c??c thu???c t??nh cho object
        this.defineProperties()

        // L???ng nghe v?? x??? l?? c??c s??? ki???n
        this.handleEvents();

        // T???i th??ng tin b??i h??t ?????u ti???n v??o UI khi l???n ?????u ti??n ch???y ???ng d???ng
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hi???n th??? tr???ng th??i ban ?????u c???a button "repeat" v?? "random"
        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    },
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            }
        })
    },
    handleEvents: function () {
        // get this `global` or app
        const _this = this;
        const cdWidth = cd.offsetWidth;

        // X??? l?? CD quay / d???ng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        // X??? l?? ph??ng to, thu nh??? CD khi scroll b??i h??t
        document.onscroll = function () {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        }

        // X??? l?? khi click play / pause 
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause();
            } else {
                audio.play();
            }
        }

        // Khi song ???????c ch???y - play
        audio.onplay = function () {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // Khi song b??? d???ng - pause
        audio.onpause = function () {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // Khi tr??nh ph??t nh???c b??i h??t khi ??ang ch???y (%)
        audio.ontimeupdate = function () {
            const currentTime = audio.currentTime;
            const totalTime = audio.duration;

            const percent = (currentTime / totalTime * 100);

            // Ki???m tra t???ng th???i gian kh??ng ph???i l?? NaN th?? c???p nh???t ti???n tr??nh
            if (totalTime) {
                const progressPercent = percent;
                progress.value = progressPercent;
            }
        }

        // X??? l?? khi tua song
        progress.onchange = function (event) {
            const seekTime = audio.duration / 100 * (event.target.value);
            audio.currentTime = seekTime;
        }

        // Khi next song b??i h??t
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // Khi prev song b??i h??t
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        // X??? l?? b???t / t???t ng???u nhi??n 1 b??i h??t
        randomBtn.onclick = function () {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom);
        }

        // X??? l?? ph??t l???i, l???p l???i 1 b??i h??t
        repeatBtn.onclick = function () {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat);
        }

        // X??? l?? next song khi audio ended
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // L???ng nghe h??nh vi k??ch v??o playlist
        playlist.onclick = function (event) {
            const songNode = event.target.closest('.song:not(.active)');
            const optionNode = event.target.closest('.option');

            if (songNode || optionNode) {
                // X??? l?? khi click v??o song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index); // event.target.getAttribute('data-index)
                    _this.loadCurrentSong();
                    audio.play();
                    _this.render();
                }

                // X??? l?? khi click v??o song option(...)
                if (optionNode) {
                    // updating....
                }
            }
        }
    },
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
                <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index=${index}>
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>

                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>

                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })

        playlist.innerHTML = htmls.join('');
    }
}

app.start();
