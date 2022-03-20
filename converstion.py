

with open("questions.json", "r") as f:
    file = f.read()

test = '\u00e2\u0080\u00b2'

print(test.encode().decode("UTF-8"))