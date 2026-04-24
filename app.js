function showScreen(name){
  document.getElementById("screen-home").style.display = "none"
  document.getElementById("screen-input").style.display = "none"
  document.getElementById("screen-result").style.display = "none"

  document.getElementById("screen-" + name).style.display = "block"
}
