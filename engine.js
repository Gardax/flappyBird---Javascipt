(function () {
    var bird = null;
    var board = null;
    var dimPipe = { width: 40, height: 420 };
    var birdPosstition = { x: 80, y: 100, h: 40, w: 50 };
    var gravity = 0.6;
    var speed = -7;
    var currentSpeed = 0;
    var score = 0;
    var noClr = 0;
    var tmStep = 0;
    var state = 0;

    (function($) {
        //rotate bird
        $.cssNumber.rotate = true;
        $.cssHooks.rotate = {
            set : function(el, v) {
                if (typeof v === 'string')
                    v = (v.indexOf("rad") != -1) ? parseInt(v) * 180 / Math.PI : parseInt(v);
                v = (~~v);
                if (v == ($.data(el, 'rotate') || 0)) return;
                el.style["MozTransform"] = el.style["MozTransform"] = el.style["-webkit-transform"]
                    = el.style["transform"] = " rotate(" + (v % 360) + "deg)";
                $.data(el, 'rotate', v);
            },
            get : function(el, computed) {
                return $.data(el, 'rotate') || 0;
            }
        };
    })(jQuery);

    function gameOver() {
        state = 2;
        $(":animated").stop();
        if (tmStep){
            tmStep = window.clearInterval(tmStep);
        }

        //rotate bird when it die
        bird.animate({ top: board.height() - birdPosstition.h, rotate: 540 }, 1000)
            .animate({ top: board.height() - birdPosstition.h }, 500, function () {
                $('#score').text(' Score: ' + score);
                start();
            });
    }

    //moves the sky left
    function Parallax(element, time) {
        element.css('left', 0).animate({ left: -15360 }, {
            duration: time * 1000, easing: 'linear',
            complete: function () { Parallax(element, time); }
        });
    }

    function BirdStep() {
        currentSpeed += gravity;
        birdPosstition.y = Math.max(birdPosstition.y + currentSpeed, 0);
        var angle = currentSpeed * 5;
        var	mh = board.height() - birdPosstition.h;

        var lo = 0;
        var actPipe = $('.obs');

        bird.css({ top: birdPosstition.y, rotate: (angle < -20) ? -20 : (angle > 90) ? 90 : angle });
        if (birdPosstition.y > mh || birdPosstition.y<=0 ){ //the fucking bird die if touch floor or roof
            return gameOver();
        }



        for (var i = actPipe.length-1; i >= 0; i--) {
            var x = parseInt(actPipe[i].style.left);
            var y = parseInt(actPipe[i].style.top);
            lo = Math.max(lo, x);


            var increaseHole=10;
            if (x+dimPipe.width -increaseHole > birdPosstition.x && x < birdPosstition.x+birdPosstition.w-increaseHole)
            {
                if (y+dimPipe.height-increaseHole > birdPosstition.y && y < birdPosstition.y+birdPosstition.h-increaseHole)
                {
                    return gameOver(); //still die
                }
            }

        }

        if (actPipe.length > 3 || lo > 300  || Math.random() >= 0.05 * (1 + noClr)){
            return;
        }

        var og = birdPosstition.h * 2; //hole in the pipe
        var oh = og + Math.floor(Math.random() * (mh - og + 1));
        var obs = $("<img/><img/>").addClass('absoluteElement obs');
        obs.css({ left: 480, zIndex: 3 }).css(dimPipe).attr('src', 'pipe.png');



        obs.appendTo(board).animate({ left: -50 }, Math.max(2000, 3500 - noClr * 50), 'linear', function () {

            //move this to increase score when you move through the pipes
            $('#score').text(' Score: ' + (score += 0.5 ));
            //end
            this.remove();
        });

        obs[0].style.top = oh + 'px';
        obs[1].style.top = (oh - og - dimPipe.height) + "px";



    }

    function jump() {
        if (state > 1) return;
        if (state == 0) {
            state = 1;
            $('#score').text(' Score: ' + (score = 0));
            Parallax($('#sky'), 200);
            $('#pipe').hide();
            tmStep = window.setInterval(BirdStep, 30);
        }
        currentSpeed = speed;
    }
    function start() {
        state = noClr = score = 0;
        birdPosstition = { x: 80, y: 100, h: 40, w: 50 };
        bird.css({ left: birdPosstition.x,
            top: birdPosstition.y,
            width: birdPosstition.w,
            height: birdPosstition.h,
            rotate: 0
        });

        $('.obs').remove();
        $('#pipe').show();
    }

    $(document).ready(function () {
        bird = $('#bird');
        board = $('#board').bind('mousedown', jump);
        start();
    });
})();