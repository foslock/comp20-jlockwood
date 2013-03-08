    // Slightly modified code by Dave Dunkin
    // http://rabblerule.blogspot.com/2009/08/detecting-swipe-in-webkit.html

    function addSwipeListener(el, listener)
    {
     var moveThreshold = 50;
     var startX;
     var startY;
     var dx;
     var dy;
     var direction;
     var current_dx;
     var current_dy;

     function cancelTouch()
     {
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      startX = null;
      startY = null;
      current_dx = null;
      current_dy = null;
     }

     function onTouchMove(e)
     {
      if (e.touches.length > 1) {
       cancelTouch();
      } else {
       dx = e.touches[0].pageX - startX;
       dy = e.touches[0].pageY - startY;
      } 
     }

     function onTouchEnd(e)
     {
       cancelTouch();
      if (Math.abs(dx) > moveThreshold) {
        listener({ target: el, direction: dx > 0 ? 'right' : 'left' });
        dx = 0;
      } else if (Math.abs(dy) > moveThreshold) {
        listener({ target: el, direction: dy > 0 ? 'down' : 'up' });
        dy = 0;
      }
     }

     function onTouchStart(e)
     {
        e.preventDefault();
        e.stopPropagation();
      if (e.touches.length == 1) {
       startX = e.touches[0].pageX;
       startY = e.touches[0].pageY;
       el.addEventListener('touchmove', onTouchMove, false);
       el.addEventListener('touchend', onTouchEnd, false);
      }
     }

     el.addEventListener('touchstart', onTouchStart, false);
    }