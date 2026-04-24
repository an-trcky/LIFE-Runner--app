document.getElementById("startBtn").addEventListener("click",()=>{

  const age = document.getElementById("age").value
  const savings = document.getElementById("savings").value
  const income = document.getElementById("income").value
  const expenses = document.getElementById("expenses").value

  if(!age || !savings || !income || !expenses){
    alert("全部入力して")
    return
  }

  // 仮処理（あとでシミュレーションに繋ぐ）
  alert("診断スタート！（ここからシミュレーションへ）")

})
