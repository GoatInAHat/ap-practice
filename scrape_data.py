from pprint import pprint
import requests
from bs4 import BeautifulSoup

response = requests.get('https://www.crackap.com')

soup = BeautifulSoup(response.text, 'lxml')

questions = {}

for child in soup.body.section.aside.findAll('div')[1].ul.findAll('li'):
    item = child.findAll('a', attrs={ 'class' : 'sub'})
    if len(item) != 0:
        if '.html' not in item[0].get('href'):
            questions[item[0].text] = {'subjectid':item[0].get('href')}

print(questions)

def get_questions(subject):
    i=0
    while True:
        i += 1
        response = requests.get(f'https://www.crackap.com{subject}question-{i}-answer-and-explanation.html')
        if str(response) == '<Response [404]>':
            print('found end of questions')
            break
        soup = BeautifulSoup(response.text, 'lxml')
        question = {'content': [], 'answers': []}
        for item in soup.body.section.div.div.main.findAll('div')[2].findAll('div')[2].findAll():
            if not item.name == 'p' and not item.name == 'ul':
                continue
            if item.name == 'p':
                if not '<strong>' in str(item):
                    question['content'].append(['text', item.text])
            elif item.name == 'ul':
                for answer in item.children:
                    if answer.text != '\n':
                        question['answers'].append(answer.text)
                
                break
        
        

        pprint(question)
        
        break

get_questions(questions['AP Chemistry']['subjectid'])