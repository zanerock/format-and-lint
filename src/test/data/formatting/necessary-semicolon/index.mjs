const f = () => ({ foo : 1 })

let foo = 5
console.log(foo);
({ foo } = f())
console.log(foo)
