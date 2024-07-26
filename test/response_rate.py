import requests
import random

url = "https://karigar.onrender.com/api/response"
tokens = ["eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmEzYWQ1YjQxYTExZWU4OGI0NzIwYTIiLCJuYW1lIjoiVzEiLCJwcm9maWxlIjoiaHR0cHM6Ly9zdGF0aWMudmVjdGVlenkuY29tL3N5c3RlbS9yZXNvdXJjZXMvcHJldmlld3MvMDIwLzc2NS8zOTkvbm9uXzJ4L2RlZmF1bHQtcHJvZmlsZS1hY2NvdW50LXVua25vd24taWNvbi1ibGFjay1zaWxob3VldHRlLWZyZWUtdmVjdG9yLmpwZyIsImVtYWlsIjoidzFAZXhhbXBsZS5jb20iLCJyb2xlIjoiV09SS0VSIiwiaWF0IjoxNzIyMDA0OTc0fQ.GD8E2v3W8OKO4Zj8I9VgUUB_VanidjKXh4DzRnyzarE",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmEzYWQ2NzQxYTExZWU4OGI0NzIwYTUiLCJuYW1lIjoiVzIiLCJwcm9maWxlIjoiaHR0cHM6Ly9zdGF0aWMudmVjdGVlenkuY29tL3N5c3RlbS9yZXNvdXJjZXMvcHJldmlld3MvMDIwLzc2NS8zOTkvbm9uXzJ4L2RlZmF1bHQtcHJvZmlsZS1hY2NvdW50LXVua25vd24taWNvbi1ibGFjay1zaWxob3VldHRlLWZyZWUtdmVjdG9yLmpwZyIsImVtYWlsIjoidzJAZXhhbXBsZS5jb20iLCJyb2xlIjoiV09SS0VSIiwiaWF0IjoxNzIyMDA1MDAzfQ.1w_1BJ7C_cawvyMj_LKm75C2GI-UYCZ-GiwKxAX4yvU",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmEzYWQ2ZDQxYTExZWU4OGI0NzIwYTgiLCJuYW1lIjoiVzMiLCJwcm9maWxlIjoiaHR0cHM6Ly9zdGF0aWMudmVjdGVlenkuY29tL3N5c3RlbS9yZXNvdXJjZXMvcHJldmlld3MvMDIwLzc2NS8zOTkvbm9uXzJ4L2RlZmF1bHQtcHJvZmlsZS1hY2NvdW50LXVua25vd24taWNvbi1ibGFjay1zaWxob3VldHRlLWZyZWUtdmVjdG9yLmpwZyIsImVtYWlsIjoidzNAZXhhbXBsZS5jb20iLCJyb2xlIjoiV09SS0VSIiwiaWF0IjoxNzIyMDA1MDMwfQ.DT1l4HKYasKmMoRsL-AySmkMgdEWWqTyeWD8GGK6RRw",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmEzYWQ3MzQxYTExZWU4OGI0NzIwYWIiLCJuYW1lIjoiVzQiLCJwcm9maWxlIjoiaHR0cHM6Ly9zdGF0aWMudmVjdGVlenkuY29tL3N5c3RlbS9yZXNvdXJjZXMvcHJldmlld3MvMDIwLzc2NS8zOTkvbm9uXzJ4L2RlZmF1bHQtcHJvZmlsZS1hY2NvdW50LXVua25vd24taWNvbi1ibGFjay1zaWxob3VldHRlLWZyZWUtdmVjdG9yLmpwZyIsImVtYWlsIjoidzRAZXhhbXBsZS5jb20iLCJyb2xlIjoiV09SS0VSIiwiaWF0IjoxNzIyMDA1NjM4fQ.WfNIpzJ5rUmXcCiPs4pSWql0yz8JF2q1y8Rmq-F1frc",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NmEzYWQ3ODQxYTExZWU4OGI0NzIwYWUiLCJuYW1lIjoiVzUiLCJwcm9maWxlIjoiaHR0cHM6Ly9zdGF0aWMudmVjdGVlenkuY29tL3N5c3RlbS9yZXNvdXJjZXMvcHJldmlld3MvMDIwLzc2NS8zOTkvbm9uXzJ4L2RlZmF1bHQtcHJvZmlsZS1hY2NvdW50LXVua25vd24taWNvbi1ibGFjay1zaWxob3VldHRlLWZyZWUtdmVjdG9yLmpwZyIsImVtYWlsIjoidzVAZXhhbXBsZS5jb20iLCJyb2xlIjoiV09SS0VSIiwiaWF0IjoxNzIyMDA1NTk2fQ.KRXwS_Q9lHFCFLZNYI3TLuOaMaS6wSah55Kc0tPUV2Q"
    ]
requestes = [
    "66a3bfdb41a11ee88b472273",
    "66a3bfdc41a11ee88b472275",
    "66a3bfdd41a11ee88b472277"
    ]
request_id = "66a3bc4b41a11ee88b472174"
def send10Responses():
    for i in range(10):
        headers = {
        'Authorization': 'Bearer ' + tokens[random.randint(0, 4)]
        }
        ratings = round(random.uniform(0, 5), 1)
        orders = random.randint(0, 100)
        print({"request": request_id, "ratings": ratings, "orders": orders})
        response = requests.post(url, json={"request": request_id, "ratings": ratings, "orders": orders}, headers=headers)
def send5Responses():
    for token in tokens:
        headers = {
        'Authorization': 'Bearer ' + token
        }
        ratings = round(random.uniform(0, 5), 1)
        orders = random.randint(0, 100)
        print({"request": request_id, "ratings": ratings, "orders": orders})
        response = requests.post(url, json={"request": request_id, "ratings": ratings, "orders": orders}, headers=headers)
def sendResponses(n):
    for i in range(n):
        headers = {
        'Authorization': 'Bearer ' + tokens[random.randint(0, 4)]
        }
        ratings = round(random.uniform(0, 5), 1)
        orders = random.randint(0, 100)
        print({"request": request_id, "ratings": ratings, "orders": orders})
        response = requests.post(url, json={"request": request_id, "ratings": ratings, "orders": orders}, headers=headers)
def send_multiRequestResponses(n):
    for i in range(n):
        re = random.randint(0, 2)
        req_id = requestes[re]
        print(re)
        headers = {
        'Authorization': 'Bearer ' + tokens[random.randint(0, 4)]
        }
        ratings = round(random.uniform(0, 5), 1)
        orders = random.randint(0, 100)
        print({"request": req_id, "ratings": ratings, "orders": orders})
        response = requests.post(url, json={"request": req_id, "ratings": ratings, "orders": orders}, headers=headers)
