from fastapi import FastAPI
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from utils import get_cpu_names, get_gpu_names, get_mb_names, build_pc, get_cpu_series, check_compatibility


app = FastAPI()

origins = [
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

@app.get("/")
async def read_root():
    return {"message": "Root"}

@app.get("/getCpus")
async def read_processors():
    return get_cpu_names()

@app.get("/getCpuSeries")
async def read_processors_series():
    return get_cpu_series()

@app.get("/getGpus")
async def read_gpus():
    return get_gpu_names()

@app.get("/getMbs")
async def read_mbs():
    return get_mb_names()

@app.get("/buildPc")
async def build_test(cpu_name: str, price_range_list: str):
    return build_pc(cpu_name, price_range_list)

@app.get("/checkCompat")
async def check_compat(cpu_name: str, gpu_name: str, mb_name: str):
    return check_compatibility(cpu_name, gpu_name, mb_name)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)