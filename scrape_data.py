import json
from pprint import pprint
import requests
from bs4 import BeautifulSoup
import time

response = requests.get('https://www.crackap.com')

soup = BeautifulSoup(response.text, 'lxml')

questions = {}

subject_num = 0
question_num = 0
current_subject = ''

def log_question(text):
    pprint(text)
    print(f'({subject_num} {question_num}) ({current_subject})')

print(questions)

def get_questions(subject):
    i=0
    qlist = []
    global question_num
    while True:
        i += 1
        question_num = i
        try:
            response = requests.get(f'https://www.crackap.com{subject}question-{i}.html')
        except:
            print('timed out, waiting')
            time.sleep(30)
            response = requests.get(f'https://www.crackap.com{subject}question-{i}.html')
        if str(response) == '<Response [404]>':
            print('found end of questions')
            break
        soup = BeautifulSoup(response.text, 'lxml')
        question = {'content': "", 'answers': {}}

        question['content'] += '<div class="content">'

        for item in soup.findAll('div', {'class': 'mcontent'})[0].children:
            
            if item.name == 'pre':
                for thing in item.findAll():
                    question['content'] += str(thing)
            
            if item.name == 'p' and not '</strong></p>' in str(item):
                print(str(item))
                question['content'] += str(item)

            if item.name == 'div' and item.get('class') == ['radio']:
                question['answers'][item.text[0]] = str(item)

            if item.name == 'div' and item.get('class') == ['answer']:
                question['correct'] = item.findAll('p')[0].findAll('span')[0].text
                question['explanation'] = str(item.findAll('p')[2])

        question['content'] += '</div>'
        log_question(question)

        question['correct'] = soup.findAll('p')[-4].text.split(' ')[-1]

        question['explanation'] = soup.findAll('p')[-2].text
                
        qlist.append(question)

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