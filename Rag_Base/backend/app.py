from fastapi import FastAPI
from pydantic import BaseModel
from rag_energy import energy_rag
# from rag_food import food_rag
# from rag_shopping import shopping_rag
# from rag_transportation import transportation_rag
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class InputData(BaseModel):
    user_input: str

@app.post("/rag/{category}")
def route_rag(category: str, data: InputData):
    user_input = data.user_input

    if category == "energy":
        return energy_rag(user_input)
    # elif category == "transportation":
    #     return transportation_rag(user_input)
    # elif category == "food":
    #     return food_rag(user_input)
    # elif category == "shopping":
    #     return shopping_rag(user_input)
    else:
        return { "error": "Invalid category" }