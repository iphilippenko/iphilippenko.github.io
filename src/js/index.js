import {Carousel} from "./carousel";
import {images} from "./images";
import './carousel/styles.scss';

let myCarousel = new Carousel('carouselContainer', images);
myCarousel.initialize();
