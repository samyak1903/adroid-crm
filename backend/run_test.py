import requests

login_res = requests.post('http://localhost:8000/auth/token', data={'username': 'admin@adroit.com', 'password': 'password'})
token = login_res.json().get('access_token')
print("Token:", token)

me_res = requests.get('http://localhost:8000/auth/me', headers={'Authorization': f'Bearer {token}'})
print("Auth/me status:", me_res.status_code)
print("Auth/me response:", me_res.text)
