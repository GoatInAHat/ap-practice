import json
from pprint import pprint
import requests
from bs4 import BeautifulSoup
import time
import re

response = requests.get('https://www.crackap.com')

soup = BeautifulSoup(response.text, 'lxml')

questions = {}

subject_num = 0
question_num = 0
current_subject = ''

def log_question():
    print(f'({subject_num} {question_num}) ({current_subject})')

print(questions)

def get_questions(subject):
    i=0
    qlist = []
    global question_num
    subject = "/ap/calculus-ab/"
    while True:
        i += 1
        question_num = i
        try:
            response = requests.get(f'https://www.crackap.com{subject}question-{i}.html', headers={
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9'
            })
            response.encoding = response.apparent_encoding
        except:
            print('timed out, waiting')
            time.sleep(40)
            response = requests.get(f'https://www.crackap.com{subject}question-{i}.html')
        if str(response) == '<Response [404]>':
            print('found end of questions')
            break
        print(response.text)
        soup = BeautifulSoup(response.text, 'html')
        question = {'content': "", 'answers': {}}

        question['content'] += '<div class="content">'

        for item in soup.findAll('div', {'class': 'mcontent'})[0].children:
            
            if item.name == 'pre':
                for thing in item.findAll():
                    question['content'] += str(thing)
            
            if item.name == 'p' and not '</strong></p>' in str(item):
                question['content'] += str(item)

            if item.name == 'div' and item.get('class') == ['radio']:
                question['answers'][item.text[0]] = re.sub(r"<input name=\"[0-9]+\" type=\"radio\" value=\"[a-zA-Z]\"/>", '', str(item.label))
        
        question['explanation'] = str(soup.findAll('div', {'id': 'answer'})[0])
        question['correct'] = soup.findAll('span', {'id': 'key'})[0].text

        question['content'] += '</div>'
        log_question()

        pprint(question)

        qlist.append(question)
        exit()

    return qlist

for child in soup.body.section.aside.findAll('div')[1].ul.findAll('li'):
    item = child.findAll('a', attrs={ 'class' : 'sub'})
    if len(item) > 0:
        subject = item[0].get('href')
        if subject != 0:
            if '.html' not in subject:
                subject_num += 1
                current_subject = subject
                questions[item[0].text] = {'subjectid':subject}
                questions[item[0].text]['questions'] = get_questions(subject)

for subject in questions:
    print(f'{subject}: {len(questions[subject]["questions"])}')

with open('questions.json', 'w') as f:
    json.dump(questions, f)