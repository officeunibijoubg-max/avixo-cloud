#!/usr/bin/env python3
"""Генерира записания глас: по един MP3 за всяка фраза от docs/voice-script.csv.

Ползва свободния български глас на Piper (bg_BG-dimitar-medium, MIT/CC0), затова
звукът работи и на устройства без български синтезатор (напр. много Android таблети).

  pip install piper-tts lameenc
  npm run voice-script            # обновява docs/voice-script.csv
  python3 scripts/generate-voice.py --model path/to/bg_BG-dimitar-medium.onnx

Прави само новите/променените фрази (помни текста в public/audio/generated.json).
Файл, записан на ръка (без запис в generated.json), никога не се презаписва.
"""
import argparse, csv, io, json, os, re, wave

import lameenc
from piper import PiperVoice
from piper.config import SynthesisConfig

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CSV = os.path.join(ROOT, "docs", "voice-script.csv")
OUT = os.path.join(ROOT, "public", "audio")
STATE = os.path.join(OUT, "generated.json")

# Самотна главна гласна е звукът на буквата („Това е А.“): без ударение синтезаторът
# я казва като неударено „ъ“, а „Ъ“ — като „ер голям“. Слагаме ударение.
VOWEL = re.compile(r"(?<![\wА-яЁё])([АЕИОУЪЮЯ])(?![\wА-яЁё])")


def prepare(text: str) -> str:
    return VOWEL.sub(lambda m: m.group(1).lower() + "́", text)


def synth(voice: PiperVoice, text: str, bitrate: int, speed: float) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as w:
        voice.synthesize_wav(prepare(text), w, syn_config=SynthesisConfig(length_scale=speed))
    buf.seek(0)
    with wave.open(buf, "rb") as w:
        enc = lameenc.Encoder()
        enc.set_bit_rate(bitrate)
        enc.set_in_sample_rate(w.getframerate())
        enc.set_channels(w.getnchannels())
        enc.set_quality(2)
        return enc.encode(w.readframes(w.getnframes())) + enc.flush()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", required=True)
    ap.add_argument("--bitrate", type=int, default=40)
    ap.add_argument("--force", action="store_true")
    # Малко по-бавно от нормалното — за малки деца.
    ap.add_argument("--speed", type=float, default=1.15, help="length_scale на Piper (>1 е по-бавно)")
    args = ap.parse_args()

    voice = PiperVoice.load(args.model)
    state = json.load(open(STATE, encoding="utf-8")) if os.path.exists(STATE) else {}
    with open(CSV, encoding="utf-8-sig") as f:
        lines = list(csv.DictReader(f))

    made = kept = 0
    for row in lines:
        rid, text = row["id"], row["текст"]
        path = os.path.join(OUT, f"{rid}.mp3")
        mine = rid in state
        if os.path.exists(path) and not mine:
            kept += 1  # записан на ръка
            continue
        if os.path.exists(path) and state.get(rid) == text and not args.force:
            continue
        with open(path, "wb") as out:
            out.write(synth(voice, text, args.bitrate, args.speed))
        state[rid] = text
        made += 1

    # Махаме генерирани файлове на фрази, които вече ги няма в сценария.
    ids = {r["id"] for r in lines}
    for rid in [r for r in state if r not in ids]:
        p = os.path.join(OUT, f"{rid}.mp3")
        if os.path.exists(p):
            os.remove(p)
        del state[rid]

    with open(STATE, "w", encoding="utf-8") as f:
        json.dump(dict(sorted(state.items())), f, ensure_ascii=False, indent=0)
    print(f"нови/обновени: {made}, записани на ръка: {kept}, общо в сценария: {len(lines)}")


if __name__ == "__main__":
    main()
