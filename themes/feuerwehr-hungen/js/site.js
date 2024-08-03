
function scrollHeader() {
    // Has scrolled class on header
    var zvalue = $(document).scrollTop();
    if ( zvalue > 75 ) {
        $("#header").addClass("scrolled");
        $("#toggle").addClass("scrolled");
    } else {
        $("#header").removeClass("scrolled");
        $("#toggle").removeClass("scrolled");
    }
}

function parallaxBackground() {
    $('.parallax').css('background-positionY', ($(window).scrollTop() * 0.3) + 'px');
}

function is_touch_device() {
    var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
    var mq = function(query) {
        return window.matchMedia(query).matches;
    }

    if (('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch) {
        return true;
    }

    // include the 'heartz' as a way to have a non matching MQ to help terminate the join
    var query = ['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join('');
    return mq(query);
}

jQuery(document).ready(function($){
    var isTouch = is_touch_device();


    let burger = document.getElementById('toggle'),
        nav= document.getElementById('main-nav');

    burger.addEventListener('click', function(e){
        this.classList.toggle('is-open');
        nav.classList.toggle('is-open');
    });

    scrollHeader();

    // Scroll Events
    if (!isTouch){
        $(document).scroll(function() {
            scrollHeader();
            parallaxBackground();
        });
    }

    if($(window).width()<830){
        $(".carousel").addClass("mobileview");
    }

    // Touch scroll
    $(document).on({
        'touchmove': function(e) {
            scrollHeader(); // Replace this with your code.
        }
    });

    //Smooth scroll to start
    $('#to-start').click(function(){
        var start_y = $('#start').position().top;
        var header_offset = 45;
        window.scroll({ top: start_y - header_offset, left: 0, behavior: 'smooth' });
        return false;
    });

    //Smooth scroll to top
    $('#to-top').click(function(){
        window.scroll({ top: 0, left: 0, behavior: 'smooth' });
        return false;
    });

    // Responsive Menu
    $('#toggle').click(function () {
        $(this).toggleClass('active');
        $('#overlay').toggleClass('open');
        $('body').toggleClass('mobile-nav-open');
        $('#page-wrapper').toggleClass('nav-open');
    });

    // Tree Menu
    $(".tree").treemenu({delay:300});

    const menuButton = document.getElementById('toggle');
    const menuList = document.getElementById('tree-menu');
    if (isTouch){
        document.addEventListener('click', (event) => {
            if (!menuList.contains(event.target) && !menuButton.contains(event.target) && menuButton.classList.contains('is-open')) {
                $(menuButton).toggleClass('active');
                $('#overlay').toggleClass('open');
                $('body').toggleClass('mobile-nav-open');
                $('#main-nav').toggleClass('is-open');
                $(menuButton).toggleClass('is-open');
            }
        });
    }


});
