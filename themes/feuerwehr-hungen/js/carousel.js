import './components/glightbox.min.js';
import './components/flickity.pkgd.min.js';

let carouselList;
let namesList = [];

document.addEventListener('DOMContentLoaded', function() {
    const carousel = document.querySelector('.main-carousel');
    carouselList = JSON.parse(carousel.getAttribute('data-list'));
    namesList = extractNames(carouselList);
})

function extractNames(data) {
    const names = [];
    for (const key in carouselList) {
        if (data.hasOwnProperty(key) && data[key].name) {
            names.push(data[key].name);
        }
    }
    return names;
}


const vornamenArray = namesList;

const lowerCaseVornamenArray = vornamenArray.map(name => name.toLowerCase());


const searchVorname = (vorname) => {
    const lowerCaseVorname = vorname.toLowerCase();
    const index = lowerCaseVornamenArray.indexOf(lowerCaseVorname);
    return index !== -1 ? index : null;
};


//import 'https://cdn.jsdelivr.net/gh/mcstudios/glightbox/dist/js/glightbox.min.js';
//import "https://unpkg.com/flickity@2/dist/flickity.pkgd.min.js";
var isMobile;
jQuery(document).ready(function($){
    if($(window).width() < 830){
        isMobile = true;
        $(".carousel").addClass("mobileView");
    }

    $("<i class='fa-solid fa-user'></i>")

    var param = GetURLParameter('person')

    if(param !== null && param !== undefined) {
        //lightboxDescription.open(document.getElementById(param))
        lightboxDescription.openAt(searchVorname(param))
        lightboxDescription.on('afterLoad.glightbox', function(event, instance) {
            console.log('lightbox opened for person'+ param);
        });
    }

    const carousel = document.querySelector('.main-carousel');
    if (!isMobile){
        var flkty = new Flickity( carousel, {
            // options
            wrapAround: true,
            contain: true,
            draggable: true,
            pageDots: true,
            imagesLoaded: true,
            resizable: true,
            percentPosition: false,
            groupCells: 0
        });
    } else {
        var flkty = new Flickity( carousel, {
            // options
            wrapAround: true,
            contain: true,
            draggable: true,
            pageDots: false,
            imagesLoaded: true,
            resizable: false,
            prevNextButtons: true,
            percentPosition: false,
            groupCells: 0
        });
    }
});


//Catch param
function GetURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++)
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam)
        {
            return sParameterName[1];
        }
    }
}

const lightbox = GLightbox({
    touchNavigation: true,
    loop: true,
    autoplayVideos: true
});
lightbox.on('open', (target) => {
    console.log('lightbox opened');
});
var lightboxDescription = GLightbox({
    openEffect: 'bounce', // Define that we want the bounce animation on open
    cssEfects: {
        // register our new animation
        bounce: {in: 'bounceIn', out: 'bounceOut'}
    },
    closeEffect: 'zoom',
    touchNavigation: true,
    loop: true,
    moreLength: 0,
    selector: '.glightbox2'
});
var lightboxVideo = GLightbox({
    selector: '.glightbox3'
});
lightboxVideo.on('slide_changed', ({ prev, current }) => {
    console.log('Prev slide', prev);
    console.log('Current slide', current);

    const { slideIndex, slideNode, slideConfig, player } = current;

    if (player) {
        if (!player.ready) {
            // If player is not ready
            player.on('ready', (event) => {
                // Do something when video is ready
            });
        }

        player.on('play', (event) => {
            console.log('Started play');
        });

        player.on('volumechange', (event) => {
            console.log('Volume change');
        });

        player.on('ended', (event) => {
            console.log('Video ended');
        });
    }
});
var lightboxInlineIframe = GLightbox({
    selector: '.glightbox4'
});