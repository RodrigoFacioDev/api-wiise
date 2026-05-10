from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from .agent import app_agent
from langchain_core.messages import HumanMessage

app = FastAPI(title="Impact Hub AI Agent API")

# Configuração de CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em produção, substitua pelo domínio do seu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    thread_id: str = "default"

class ChatResponse(BaseModel):
    response: str

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        inputs = {"messages": [HumanMessage(content=request.message)]}
        # Config for stateful interaction (if needed in future)
        config = {"configurable": {"thread_id": request.thread_id}}
        
        result = await app_agent.ainvoke(inputs, config=config)
        
        # Get the last message from the agent
        last_message = result["messages"][-1]
        content = last_message.content
        
        # Handle list content (common in Gemini/Multimodal models)
        if isinstance(content, list):
            text_response = "".join([block["text"] for block in content if "text" in block])
        else:
            text_response = content
            
        return ChatResponse(response=text_response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
