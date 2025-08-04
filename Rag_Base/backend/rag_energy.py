import os
from dotenv import load_dotenv
load_dotenv()

import google.generativeai as genai
from langchain_google_genai import GoogleGenerativeAI
from langchain_community.document_loaders import JSONLoader
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain.chains import ConversationalRetrievalChain
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.prompts import PromptTemplate


def energy_rag(user_input):
    google_api_key = os.getenv("GOOGLE_API_KEY_4")
    folder = "./jsonfiles/energy"
    documents = []

    for file in os.listdir(folder):
        if file.endswith(".json"):
            f = os.path.join(folder, file)
            loader = JSONLoader(file_path=f, jq_schema=".", text_content=False)
            documents.extend(loader.load())

    faiss_index_dir = "faiss_index_energy"
    embedding_model = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=google_api_key)

    faiss_main_file = os.path.join(faiss_index_dir, "index.faiss")
    faiss_pkl_file = os.path.join(faiss_index_dir, "index.pkl")

    if os.path.exists(faiss_main_file) and os.path.exists(faiss_pkl_file):
        vectorstore = FAISS.load_local(faiss_index_dir, embedding_model, allow_dangerous_deserialization=True)
    else:
        vectorstore = FAISS.from_documents(documents, embedding_model)
        vectorstore.save_local(faiss_index_dir)

    retriever = vectorstore.as_retriever()

    template = '''
    Chat History : {chat_history}
    Context : {context}
    Question : {question}
    Instructions:
    1. For the Energy tracker you have to use the below context:
    -> Apply the appropriate formula to calculate the CO₂ amount based on the question
    use this formula: Total = quantity * emission factor,  where user will give quantity and material type. from that get average weight from context.
    In the json file all the energy with there unit and there emission factor is given use that .
    In the quantity the user will give input as number and then multiply it to emission factor of that energy
    -> Output the CO₂ amount (in kg).
    -> Also give 2 suggestions to reduce this emission.
    '''

    custom_prompt = PromptTemplate.from_template(template)
    memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7, google_api_key=google_api_key)

    conversational_qa_chain = ConversationalRetrievalChain.from_llm(
        llm=llm,
        retriever=retriever,
        memory=memory,
        combine_docs_chain_kwargs={"prompt": custom_prompt},
        return_source_documents=False
    )

    try:
        result = conversational_qa_chain({"question": user_input})
        return {"answer": result["answer"]}
    except Exception as e:
        return {"error": str(e)}