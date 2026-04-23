import json
import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings

CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "..", "chroma_db")
DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "data")


def load_menu_documents():
    """Load menu data and convert to documents for RAG."""
    menu_path = os.path.join(DATA_DIR, "menu_knowledge.json")
    with open(menu_path, "r") as f:
        data = json.load(f)

    documents = []

    # Create a document for each menu item
    for item in data["menu_items"]:
        doc = f"""Menu Item: {item['name']}
Category: {item['category']}
Price: ₹{item['price']}
Preparation Time: {item['prepTime']} minutes
Description: {item['description']}
Nutrition: {item['nutrition']['calories']} calories, {item['nutrition']['protein']}g protein, {item['nutrition']['carbs']}g carbs, {item['nutrition']['fat']}g fat
Tags: {', '.join(item['tags'])}
Allergens: {', '.join(item['allergens']) if item['allergens'] else 'None'}
Student Rating: {item['rating']}/5
Monthly Orders: {item['ordersThisMonth']}
Available: {'Yes' if item['isAvailable'] else 'No'}
Stock Remaining: {item['stock']}"""
        documents.append(doc)

    # Add canteen info
    info = data["canteen_info"]
    canteen_doc = f"""Canteen Name: {info['name']}
Operating Hours: {info['operating_hours']}
Seating Capacity: {info['seating_capacity']} people
Number of Tables: {info['number_of_tables']}
Active Cooking Stations: {info['active_cooking_stations']}
Policies: {' | '.join(info['policies'])}"""
    documents.append(canteen_doc)

    return documents


def create_vectorstore():
    """Create or load the ChromaDB vector store with menu knowledge."""
    documents = load_menu_documents()

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )
    chunks = text_splitter.create_documents(documents)

    # Use a lightweight local embedding model (no API key needed)
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"}
    )

    vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_PERSIST_DIR
    )

    return vectorstore


def get_retriever():
    """Get or create the RAG retriever."""
    embeddings = HuggingFaceEmbeddings(
        model_name="all-MiniLM-L6-v2",
        model_kwargs={"device": "cpu"}
    )

    # Try to load existing vectorstore
    if os.path.exists(CHROMA_PERSIST_DIR):
        try:
            vectorstore = Chroma(
                persist_directory=CHROMA_PERSIST_DIR,
                embedding_function=embeddings
            )
            # Check if it has documents
            if vectorstore._collection.count() > 0:
                return vectorstore.as_retriever(search_kwargs={"k": 5})
        except Exception:
            pass

    # Create new vectorstore
    vectorstore = create_vectorstore()
    return vectorstore.as_retriever(search_kwargs={"k": 5})
