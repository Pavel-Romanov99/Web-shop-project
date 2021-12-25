var slideIndex = 1;
showDivs(slideIndex);

function plusDivs() {
  showDivs(slideIndex += 1);
}

function showDivs(n) {
  var x = document.getElementsByClassName("mySlides");

  console.log(x)

  if (slideIndex % 2 === 0) {
    x[1].style.display = 'none';
    x[0].style.display = 'block';
  }
  else {
    x[0].style.display = 'none';
    x[1].style.display = 'block';
  }

}
