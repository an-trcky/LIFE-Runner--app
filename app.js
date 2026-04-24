document.getElementById("startBtn").addEventListener("click",()=>{

  const age = Number(document.getElementById("age").value)
  const savings = Number(document.getElementById("savings").value)
  const income = Number(document.getElementById("income").value)
  const expenses = Number(document.getElementById("expenses").value)

  console.log(age, savings, income, expenses)

})
