$(document).ready(function () {
  function setHeight() {
    windowHeight = $(window).innerHeight();
    $('#map').css('min-height', windowHeight);
    $('#navbar').css('min-height', windowHeight);
  };
  setHeight();

  $(window).resize(function () {
    setHeight();
  });
});
// Collapsing and uncollapsing navbar when on a smaller screen
$(document).ready(function () {
  function alterClass() {
    let windowWidth = document.body.clientWidth;
    if (windowWidth < 1024) {
      $('#navbar').removeClass('show');
    }else if (windowWidth >= 1025){
      $('#navbar').addClass('show');
    }
  }
  $(window).resize(function () {
    alterClass();
  });
});