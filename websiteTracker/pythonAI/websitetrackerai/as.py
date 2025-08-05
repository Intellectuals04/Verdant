import google.generativeai as genai

genai.configure(api_key="AIzaSyBc_uZo4E-86M2ixV9tnPxa7ClzoNIA724")

models = genai.list_models()

for m in models:
    print(f"{m.name} → {m.supported_generation_methods}")
