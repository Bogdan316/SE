from bs4 import BeautifulSoup, PageElement, Tag
import requests
import os
import json

CPU = 'https://pc-builder.io/cpu'
MB = 'https://pc-builder.io/motherboard'
GPU = 'https://pc-builder.io/gpu'


def request(url: str, dst_dir: str = None):
    file = url[url.rfind('/') + 1:] + '.html'
    if dst_dir:
        file = os.path.join(dst_dir, file)

    if os.path.exists(file):
        with open(file, encoding='utf-8') as file:
            html = file.read()
    else:
        resp = requests.request('GET', url, headers={'User-Agent': 'Mozilla/5.0'})
        resp.raise_for_status()
        with open(file, 'w', encoding='utf-8') as out:
            out.write(resp.text)

        html = resp.text

    return html


def get_part(url: str, name: str):
    soup = BeautifulSoup(request(url, name), 'html.parser')
    parts = soup.find_all(attrs={'class': 'product'})
    specs = []
    for c in parts:
        l: Tag
        for l in c.find_all_next('a'):
            if 'Add to Build' not in l.get_text():
                link = l.get('href')
                if link.startswith(url):
                    specs.append(get_part_spec(link, name))

    with open(os.path.join(name, name + 's.json'), 'w', encoding='utf-8') as out:
        json.dump(specs, out, indent=4)


def get_part_spec(url: str, name: str) -> dict:
    soup = BeautifulSoup(request(url, name), 'html.parser')
    specs = soup.find_all(attrs={'class': 'spec-variant-box'})
    specs_dict = {}
    for s in specs:
        if s.div:
            key, val = s.div.find_all('span')
            specs_dict[key.get_text()] = val.get_text()
    return specs_dict


if __name__ == '__main__':
    get_part(CPU, 'cpu')
    get_part(MB, 'motherboard')
    get_part(GPU, 'gpu')
