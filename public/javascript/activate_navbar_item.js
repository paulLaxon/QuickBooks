navbarClick = function () {
    // Get the container element
  let navContainer = document.getElementById("navbarSupportedContent");

  // Get all buttons with class="btn" inside the container
  let items = navContainer.getElementsByClassName("nav-item");
  console.log(items);
  // Loop through the buttons and add the active class to the current/clicked button
  for (let i = 0; i < items.length; i++) {
    console.log('changing active nav item');
    items[i].addEventListener("click", function() {
    let current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
    });
  }
}
