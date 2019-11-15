export class Carousel {
    constructor(container, images = []) {
        this.transition = {
            speed: 300,
            easing: ''
        };
        this.container = container instanceof HTMLElement
            ? container
            : (typeof container === 'string'
                ? document.querySelector(`#${container}`)
                : throw new Error('container field must be a HTMLElement or element ID'));
        if (!this.container) {
            throw new Error(`Cannot find container element with ID - ${container}`);
        }
        this.images = Array.isArray(images) ? images : throw new Error('images field must be an array');
        this.totalSlides = this.images.length;
        this.swipeStart = this.swipeStart.bind(this);
        this.swipeMove = this.swipeMove.bind(this);
        this.swipeEnd = this.swipeEnd.bind(this);
    }

    initialize() {
        this.currentSlide = 0;
        this.currentLeftPosition = 0;
        this.swipeData = {};
        this.createSlides();
        this.createNavButtons();
        this.currentSlide++;
        this.isAnimating = false;
        this.goToSlide();
        this.addSwipeListeners('mousedown');
    }

    createSlides() {
        this.carouselInnerElem = document.createElement('div');
        this.carouselInnerElem.setAttribute('class', 'carousel-inner');
        this.container.setAttribute('class', 'carousel-container');
        this.container.appendChild(this.carouselInnerElem);
        this.images.forEach(imgSrc => {
            let imgContainer = document.createElement('div');
            imgContainer.setAttribute('class', 'carousel-item-container');
            imgContainer.innerHTML = `<img src="${imgSrc}" class="carousel-item" alt="carousel item" />`;
            this.carouselInnerElem.appendChild(imgContainer);
        });
        this.carouselInnerElem.appendChild(this.container.querySelectorAll('.carousel-item-container')[0].cloneNode(true));
        this.carouselInnerElem.insertBefore(
            this.container.querySelectorAll('.carousel-item-container')[this.totalSlides - 1].cloneNode(true),
            this.carouselInnerElem.firstChild);
        let allSlides = this.carouselInnerElem.querySelectorAll('.carousel-item-container');
        this.carouselInnerElem.style.width = (this.totalSlides + 2) * 100 + "%";
        for (let i = 0; i < this.totalSlides + 2; i++) {
            allSlides[i].style.width = 100 / (this.totalSlides + 2) + "%";
        }
        this.slideWidth = allSlides[0].offsetWidth;
    }

    createNavButtons() {
        ['prev', 'next'].forEach(el => {
            let button = document.createElement('button');
            button.setAttribute('class', `nav-button nav-button_${el}`);
            this.container.appendChild(button);
            button.addEventListener('click', () => {
                if (!this.container.classList.contains('isAnimating')) {
                    if (el === 'prev') {
                        if (this.currentSlide === 1) {
                            this.currentSlide = this.totalSlides + 1;
                        }
                    } else {
                        if (this.currentSlide === this.totalSlides) {
                            this.currentSlide = 0;
                        }
                    }
                    this.carouselInnerElem.style.left = -this.currentSlide * this.slideWidth + 'px';
                    el === 'prev' ? this.currentSlide-- : this.currentSlide++;
                    setTimeout(() => {
                        this.goToSlide();
                    }, 20);
                }
            }, false);
        });
    }

    getSliderPosition() {
        this.currentLeftPosition = parseInt(this.carouselInnerElem.style.left.split('px')[0]) || 0;
    }

    addSwipeListeners(type) {
        switch (type) {
            case 'mousedown':
                this.carouselInnerElem.addEventListener('mousedown', this.swipeStart);
                this.carouselInnerElem.addEventListener('touchstart', this.swipeStart);
                break;
            case 'mousemove':
                this.carouselInnerElem.addEventListener('mousemove', this.swipeMove);
                this.carouselInnerElem.addEventListener('touchmove', this.swipeMove);
                break;
            case 'mouseup':
                document.body.addEventListener('mouseup', this.swipeEnd);
                document.body.addEventListener('touchend', this.swipeEnd);
                break;

        }
    }

    removeSwipeListeners() {
        this.carouselInnerElem.removeEventListener('mousemove', this.swipeMove);
        this.carouselInnerElem.removeEventListener('touchmove', this.swipeMove);
        document.body.removeEventListener('mouseup', this.swipeEnd);
        document.body.removeEventListener('touchend', this.swipeEnd);
    }

    swipeStart(event) {
        let touch = event;
        this.getSliderPosition();
        if (!this.isAnimating) {
            if (event.type === 'touchstart') {
                touch = event.targetTouches[0] || event.changedTouches[0];
            }
            this.swipeData.swipeStartX = touch.pageX;
            this.swipeData.swipeStartY = touch.pageY;
            this.addSwipeListeners('mousemove');
            this.addSwipeListeners('mouseup');
        }
    }

    swipeMove(event) {
        let touch = event;
        if (event.type === 'touchmove') {
            touch = event.targetTouches[0] || event.changedTouches[0];
        }
        this.swipeData.swipeMoveX = touch.pageX;
        this.swipeData.swipeMoveY = touch.pageY;
        if (Math.abs(this.swipeData.swipeMoveX - this.swipeData.swipeStartX) < 40) return;
        this.isAnimating = true;
        this.container.classList.add('isAnimating');
        event.preventDefault();
        if (this.currentLeftPosition + this.swipeData.swipeMoveX - this.swipeData.swipeStartX > 0 && !this.currentLeftPosition) {
            this.currentLeftPosition = -this.totalSlides * this.slideWidth;
        } else if (this.currentLeftPosition + this.swipeData.swipeMoveX - this.swipeData.swipeStartX < -(this.totalSlides + 1) * this.slideWidth) {
            this.currentLeftPosition = -this.slideWidth;
        }
        this.carouselInnerElem.style.left = this.currentLeftPosition + this.swipeData.swipeMoveX - this.swipeData.swipeStartX + "px";
    }

    swipeEnd() {
        this.getSliderPosition();
        if (!Math.abs(this.swipeData.swipeMoveX - this.swipeData.swipeStartX)) return;
        this.swipeData.swipeDirection = this.swipeData.swipeStartX < this.swipeData.swipeMoveX ? 'left' : 'right';
        if (!(Math.abs(this.swipeData.swipeMoveX - this.swipeData.swipeStartX) < 40 || typeof this.swipeData.swipeMoveX === 'undefined')) {
            this.swipeData.swipeDirection === 'left' ? this.currentSlide-- : this.currentSlide++;
            if (this.currentSlide < 0) {
                this.currentSlide = this.totalSlides;
            } else if (this.currentSlide === this.totalSlides + 2) {
                this.currentSlide = 1;
            }
        }
        this.goToSlide();
        this.swipeData = {};
        this.isAnimating = false;
        this.container.classList.remove('isAnimating');
        this.removeSwipeListeners();
    }


    goToSlide() {
        this.carouselInnerElem.style.transition = 'left ' + this.transition.speed / 1000 + 's ' + this.transition.easing;
        this.carouselInnerElem.style.left = -this.currentSlide * this.slideWidth + 'px';
        this.container.classList.add('isAnimating');
        setTimeout(() => {
            this.carouselInnerElem.style.transition = '';
            this.container.classList.remove('isAnimating');
        }, this.transition.speed);
    }
}
