from google import genai

client = genai.Client(api_key="AIzaSyCR4mgi5FgyHeIcRthwSlzdIDOoA44p9E0")
response = client.models.generate_content(
    model="gemini-2.0-flash", contents="Explain how AI works"
)

print(response)