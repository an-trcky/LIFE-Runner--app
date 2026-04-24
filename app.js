document.getElementById("startBtn").addEventListener("click",()=>{

  const age = Number(document.getElementById("age").value)
  const savings = Number(document.getElementById("savings").value)
  const income = Number(document.getElementById("income").value)
  const expenses = Number(document.getElementById("expenses").value)

  let yearly = (income - expenses) * 12
  let future = savings + yearly * 10
  
  document.getElementById("resultBox").innerHTML =
    "10年後資産：" + future + "万円"

})
