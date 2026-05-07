from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import base64
from io import BytesIO
from PIL import Image
from transformers import CLIPProcessor, CLIPModel
import torch

app = FastAPI()

print("Loading CLIP Model (this takes a few seconds on startup)...")
model_name = "openai/clip-vit-base-patch32"
model = CLIPModel.from_pretrained(model_name)
processor = CLIPProcessor.from_pretrained(model_name)
print("CLIP Model Loaded successfully!")

class ImageRequest(BaseModel):
    image: str

@app.post("/embed")
async def get_embedding(req: ImageRequest):
    try:
        # Decode the base64 image
        # It may start with "data:image/jpeg;base64," so we strip that off if present
        base64_data = req.image
        if "," in base64_data:
            base64_data = base64_data.split(",")[1]
            
        image_data = base64.b64decode(base64_data)
        image = Image.open(BytesIO(image_data)).convert("RGB")
        
        # Process image and get embedding
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            image_features = model.get_image_features(**inputs)
            
        # Normalize the embedding
        image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
        
        # Convert tensor to a flat Python list
        embedding = image_features.squeeze().tolist()
        
        return {"embedding": embedding}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
