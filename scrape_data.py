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

"""
Question json structure

{
    subjects: {
        subject_name: "",
        subject_id: ""
        questions: [
            {
                content: [
                    [type, text],
                ],
                answers: []
            },
        ]
    }
}

"""

def log_question(text):
    text = text.replace('\n', '')
    print(f'({subject_num} {question_num})  {text}')

print(questions)

def get_questions(subject):
    i=0
    qlist = []
    global question_num
    while True:
        i += 1
        question_num = i
        try:
            response = requests.get(f'https://www.crackap.com{subject}question-{i}-answer-and-explanation.html')
        except:
            print('timed out, waiting')
            time.sleep(30)
            response = requests.get(f'https://www.crackap.com{subject}question-{i}-answer-and-explanation.html')
        if str(response) == '<Response [404]>':
            print('found end of questions')
            break
        soup = BeautifulSoup(response.text, 'lxml')
        question = {'content': [], 'answers': {}}
        
        question_text = None
        
        for item in soup.findAll('div', {'class': 'mcontent'})[0].findAll():
            if not item.name == 'p' and not item.name == 'ul':
                continue
            if item.name == 'p':
                if item.findAll('img') != []:
                    question_text = item.findAll('img')[0].get('src')
                    question['content'].append({'img': question_text})
                if not '<strong>' in str(item):
                    question['content'].append({'text': item.text})
                    log_question(item.text)
        
        for answer in soup.findAll('ul', {'class': 'qlist'})[0].findAll('li'):
            img = None
            text = None
            
            if item.findAll('img') != []:
                img = item.findAll('img')[0].get('src')
            if answer.text != '\n':
                text = answer.text.split('. ')[1].lstrip(' ')
            
            question['answers'][answer.text[0]] = {'img': img, 'text': text}

        question['correct'] = soup.findAll('p')[-4].text.split(' ')[-1]

        question['explanation'] = soup.findAll('p')[-2].text
                
        qlist.append(question)

    return qlist

for child in soup.body.section.aside.findAll('div')[1].ul.findAll('li'):
    item = child.findAll('a', attrs={ 'class' : 'sub'})
    if len(item) != 0:
        if '.html' not in item[0].get('href'):
            subject_num += 1
            questions[item[0].text] = {'subjectid':item[0].get('href')}
            questions[item[0].text]['questions'] = get_questions(item[0].get('href'))

for subject in questions:
    print(f'{subject}: {len(questions[subject]["questions"])}')

with open('questions.json', 'w') as f:
    json.dump(questions, f)