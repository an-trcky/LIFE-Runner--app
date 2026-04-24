function showScreen(name){
  document.getElementById("screen-home").style.display = "none"
  document.getElementById("screen-input").style.display = "none"
  document.getElementById("screen-result").style.display = "none"

  document.getElementById("screen-" + name).style.display = "block"
}
　document.getElementById("startBtn").addEventListener("click",()=>{
  alert("ここから診断画面へ（次で作る）")
})
