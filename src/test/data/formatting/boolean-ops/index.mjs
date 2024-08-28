const variable1 = 1
const variable2 = 2
const variable3 = 3
const variable4 = 4
const variable5 = 5
const variable6 = 6

const foo = () => variable1 || (((variable2 && variable3) || (variable1 && variable2 && variable3 && variable4 && variable5 && variable6)) || variable4) || !(variable4 && !variable3)