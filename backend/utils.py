import json
import os
from typing import List

def read_component_data(json_path):
    with open(json_path) as f:
        component_data = json.load(f)
        return component_data

def find_compatible_system(request_criteria):
    cpu_data = read_component_data(os.path.join(os.path.dirname(__file__), "data", "cpu", "cpus.json"))
    gpu_data = read_component_data(os.path.join(os.path.dirname(__file__), "data", "gpu", "gpus.json"))
    motherboard_data = read_component_data(os.path.join(os.path.dirname(__file__), "data", "motherboard", "motherboards.json"))
    
    series = request_criteria.get("Series")
    price_range = request_criteria.get("Price_Range")
    
    filtered_cpus = [cpu for cpu in cpu_data if cpu.get("Series") == series]
    compatible_systems = []
    for cpu in filtered_cpus:
        cpu_socket = cpu.get("Socket")
        compatible_motherboards = [
            mb for mb in motherboard_data 
            if mb.get("Socket / CPU") == cpu_socket 
        ]
        for motherboard in compatible_motherboards:
            for gpu in gpu_data:
                system_price = float(cpu.get("price").replace("$", "")) + float(gpu.get("price").replace("$", "")) + float(motherboard.get("price").replace("$", ""))
                if price_range[0] < system_price and price_range[1] > system_price:
                    compatible_systems.append({"CPU" : cpu.get("name"), "GPU" : gpu.get("name"), "Motherboard" : motherboard.get("name"), "Price" : system_price})
    
    return sorted(compatible_systems, key=lambda x: x['Price'], reverse=True)[0] if compatible_systems else None

def check_compatibility(cpu_name, gpu_name, motherboard_name):
    cpu_data = read_component_data(os.path.join(os.path.dirname(__file__), "data", "cpu", "cpus.json"))
    gpu_data = read_component_data(os.path.join(os.path.dirname(__file__), "data", "gpu", "gpus.json"))
    motherboard_data = read_component_data(os.path.join(os.path.dirname(__file__), "data", "motherboard", "motherboards.json"))
    cpu_component = next((cpu for cpu in cpu_data if cpu['name'] == cpu_name), None)
    gpu_component = next((gpu for gpu in gpu_data if gpu['name'] == gpu_name), None)
    motherboard_component = next((motherboard for motherboard in motherboard_data if motherboard['name'] == motherboard_name), None)

    if cpu_component and gpu_component and motherboard_component:
        compatible = are_components_compatible(cpu_component, gpu_component, motherboard_component)
        if compatible:
            return True
        else:
            return False
    else:
        return False
    
def are_components_compatible(cpu, gpu, motherboard):
    cpu_socket = cpu['Socket']
    motherboard_socket = motherboard['Socket / CPU']
    gpu_slot = gpu['Interface']
    if cpu_socket == motherboard_socket:
        for slot, count in motherboard.items():
            if gpu_slot in slot and int(count) > 0:
                return True
        return False
    else:
        return False

def get_cpu_names():
    cpu_data = read_component_data(os.path.join(os.path.dirname(__file__), "data", "cpu", "cpus.json"))
    return [cpu.get("name") for cpu in cpu_data]

def get_cpu_series():
    cpu_data = read_component_data(os.path.join(os.path.dirname(__file__), "data", "cpu", "cpus.json"))
    return [cpu.get("Series") for cpu in cpu_data]

def get_gpu_names():
    gpu_data = read_component_data(os.path.join(os.path.dirname(__file__), "data", "gpu", "gpus.json"))
    return [gpu.get("name") for gpu in gpu_data]

def get_mb_names():
    mb_data = read_component_data(os.path.join(os.path.dirname(__file__), "data", "motherboard", "motherboards.json"))
    return [mb.get("name") for mb in mb_data]

def build_pc(cpu_name: str, price_range: str) -> dict:
    price_range_list = [int(x) for x in price_range.split(",")]
    return find_compatible_system({"Series": cpu_name, "Price_Range": price_range_list})
