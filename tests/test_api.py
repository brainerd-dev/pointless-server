import requests
import json

baseUrl = 'http://localhost:5000'

with open('../package.json') as f:
  packageInfo = json.load(f)

def test_getApiRoot():
  url = f'{baseUrl}/api'
  version = packageInfo['version']

  response = requests.request('GET', url)
  body = response.json()

  assert response.status_code == 200
  assert body['message'] == f'Welcome to the Banana Peel API v{version}!'
