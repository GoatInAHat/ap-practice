const str = "\u00e2\u0086\u0092"

const test = new TextEncoder().encode(str);

for (const digit of test) {
    console.log(String.fromCharCode(digit))
}

console.log(test)