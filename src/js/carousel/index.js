export class Carousel {
    constructor(container, images = []) {
        this.container = container instanceof HTMLElement
            ? container
            : (typeof container === 'string'
                ? document.querySelector(`#${container}`)
                : throw new Error('container field must be a HTMLElement or element ID'));
        if (!this.container) {
            throw new Error(`Cannot find container element with ID - ${container}`);
        }
        this.images = Array.isArray(images) ? images : throw new Error('images field must be an array');
        this.swipeStart = this.swipeStart.bind(this);
        this.swipeMove = this.swipeMove.bind(this);
        this.swipeEnd = this.swipeEnd.bind(this);
    }

    initialize() {
        this.transition = {
            speed: 300,
            easing: ''
        };
        this.totalSlides = this.images.length;
        this.currentSlide = 0;
        this.currentLeftPosition = 0;
        this.swipeData = {};
        this.container.setAttribute('class', 'carousel-container');
        this.carouselInnerElem = document.createElement('div');
        this.carouselInnerElem.setAttribute('class', 'carousel-inner');
        this.container.appendChild(this.carouselInnerElem);
        this.createNavButtons();
        this.images.forEach(imgSrc => {
            let imgContainer = document.createElement('div');
            imgContainer.setAttribute('class', 'carousel-item-container');
            imgContainer.innerHTML = `<img src="${imgSrc}" class="carousel-item" alt="carousel item" />`;
            this.carouselInnerElem.appendChild(imgContainer);
            return imgContainer;
        });
        this.carouselInnerElem.appendChild(this.container.querySelectorAll('.carousel-item-container')[0].cloneNode(true));
        this.carouselInnerElem.insertBefore(
            this.container.querySelectorAll('.carousel-item-container')[this.totalSlides - 1].cloneNode(true),
            this.carouselInnerElem.firstChild);
        this.currentSlide++;
        this.allSlides = this.carouselInnerElem.querySelectorAll('.carousel-item-container');
        this.carouselInnerElem.style.width = (this.totalSlides + 2) * 100 + "%";
        for (let i = 0; i < this.totalSlides + 2; i++) {
            this.allSlides[i].style.width = 100 / (this.totalSlides + 2) + "%";
        }
        this.carouselInnerElem.addEventListener('mousedown', this.swipeStart);
        this.carouselInnerElem.addEventListener('touchstart', this.swipeStart);
        this.isAnimating = false;
        this.slideWidth = this.allSlides[0].offsetWidth;
        this.goToSlide();
    }

    createNavButtons() {
        ['prev', 'next'].forEach(el => {
            let button = document.createElement('button');
            button.setAttribute('class', `nav-button nav-button_${el}`);
            this.container.appendChild(button);
            button.addEventListener('click', () => {
                if (!this.container.classList.contains('isAnimating')) {
                    console.log(this.currentSlide);
                    if (el === 'prev') {
                        if (this.currentSlide === 1) {
                            this.currentSlide = this.totalSlides + 1;
                            this.carouselInnerElem.style.left = -this.currentSlide * this.slideWidth + 'px';
                        }
                        this.currentSlide--;
                    } else {
                        if (this.currentSlide === this.totalSlides) {
                            this.currentSlide = 0;
                            this.carouselInnerElem.style.left = -this.currentSlide * this.slideWidth + 'px';
                        }
                        this.currentSlide++;
                    }

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

    swipeStart(event) {
        let touch = event;
        this.getSliderPosition();
        if (!this.isAnimating) {
            if (event.type === 'touchstart') {
                touch = event.targetTouches[0] || event.changedTouches[0];
            }
            this.swipeData.swipeStartX = touch.pageX;
            this.swipeData.swipeStartY = touch.pageY;
            this.carouselInnerElem.addEventListener('mousemove', this.swipeMove);
            this.carouselInnerElem.addEventListener('touchmove', this.swipeMove);
            document.body.addEventListener('mouseup', this.swipeEnd);
            document.body.addEventListener('touchend', this.swipeEnd);
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
        console.log('swipe move', this.currentLeftPosition);
        if (this.currentLeftPosition + this.swipeData.swipeMoveX - this.swipeData.swipeStartX > 0 && !this.currentLeftPosition) {
            this.currentLeftPosition = -this.totalSlides * this.slideWidth;
            console.log('this.currentLeftPosition', this.currentLeftPosition);
        } else if (this.currentLeftPosition + this.swipeData.swipeMoveX - this.swipeData.swipeStartX < -(this.totalSlides + 1) * this.slideWidth) {
            this.currentLeftPosition = -this.slideWidth;
            console.log('this.currentLeftPosition', this.currentLeftPosition);
        }

        this.carouselInnerElem.style.left = this.currentLeftPosition + this.swipeData.swipeMoveX - this.swipeData.swipeStartX + "px";
    }

    swipeEnd() {
        console.log('swipe end');
        this.getSliderPosition();
        if (!Math.abs(this.swipeData.swipeMoveX - this.swipeData.swipeStartX)) return;
        this.swipeData.swipeDirection = this.swipeData.swipeStartX < this.swipeData.swipeMoveX ? 'left' : 'right';
        if (!(Math.abs(this.swipeData.swipeMoveX - this.swipeData.swipeStartX) < 40 || typeof this.swipeData.swipeMoveX === 'undefined')) {
            this.swipeData.swipeDirection === 'left' ? this.currentSlide-- : this.currentSlide++;
            console.log(this.currentSlide);
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
        this.carouselInnerElem.removeEventListener('mousemove', this.swipeMove);
        this.carouselInnerElem.removeEventListener('touchmove', this.swipeMove);
        document.body.removeEventListener('mouseup', this.swipeEnd);
        document.body.removeEventListener('touchend', this.swipeEnd);
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
