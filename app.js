console.log("JS OK")

window.addEventListener("DOMContentLoaded", () => {

  const startBtn = document.getElementById("startBtn")

  if(!startBtn){
    console.log("ボタン取得失敗")
    return
  }

  startBtn.addEventListener("click", () => {
    alert("診断画面へ（次で実装）")
  })

})
