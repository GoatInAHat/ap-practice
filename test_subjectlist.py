import re

with open('questions.json', 'r+') as f:
    f.write(re.sub(r"<input name=\"[0-9]+\" type=\"radio\" value=\"[a-zA-Z]\"/>", '', f.read()))
